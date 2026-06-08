import "server-only";

import { normalizePageUrl } from "~/features/seo/lib/normalize-page-url";

const GSC_BASE = "https://www.googleapis.com/webmasters/v3";

export type GscSite = { siteUrl: string; permissionLevel?: string };

export type GscSearchRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

type SearchAnalyticsBody = {
  startDate: string;
  endDate: string;
  dimensions?: string[];
  dimensionFilterGroups?: {
    filters: {
      dimension: string;
      operator: string;
      expression: string;
    }[];
  }[];
  rowLimit?: number;
  dataState?: "final" | "all";
};

function formatGscDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Intervalo padrão (28 dias, com atraso de 3 dias do GSC).
 */
export function getGscDateRange(days = 28): { startDate: string; endDate: string } {
  const end = new Date();
  end.setUTCDate(end.getUTCDate() - 3);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - days);
  return { startDate: formatGscDate(start), endDate: formatGscDate(end) };
}

/**
 * Lista propriedades verificadas no Search Console.
 */
export async function listGscSites(accessToken: string): Promise<GscSite[]> {
  const res = await fetch(`${GSC_BASE}/sites`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new SearchConsoleApiError(res.status, err);
  }
  const data = (await res.json()) as { siteEntry?: GscSite[] };
  return data.siteEntry ?? [];
}

/**
 * Consulta Search Analytics (performance).
 */
export async function querySearchAnalytics(
  accessToken: string,
  siteUrl: string,
  body: SearchAnalyticsBody,
): Promise<GscSearchRow[]> {
  const encodedSite = encodeURIComponent(siteUrl);
  const res = await fetch(`${GSC_BASE}/sites/${encodedSite}/searchAnalytics/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...body, dataState: body.dataState ?? "final" }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new SearchConsoleApiError(res.status, err);
  }

  const data = (await res.json()) as { rows?: GscSearchRow[] };
  return data.rows ?? [];
}

export class SearchConsoleApiError extends Error {
  constructor(
    public status: number,
    public body: string,
  ) {
    super(`Search Console API ${status}`);
    this.name = "SearchConsoleApiError";
  }
}

/**
 * Escolhe a propriedade GSC que cobre a URL informada.
 */
export function resolveGscProperty(pageUrl: string, sites: GscSite[]): string | null {
  let parsed: URL;
  try {
    parsed = new URL(normalizePageUrl(pageUrl));
  } catch {
    return null;
  }

  const host = parsed.hostname.replace(/^www\./, "");

  for (const site of sites) {
    const prop = site.siteUrl;
    if (prop.startsWith("sc-domain:")) {
      const domain = prop.slice("sc-domain:".length);
      if (host === domain || host.endsWith(`.${domain}`)) return prop;
      continue;
    }
    try {
      const propUrl = new URL(prop.endsWith("/") ? prop : `${prop}/`);
      const propHost = propUrl.hostname.replace(/^www\./, "");
      if (host === propHost) {
        if (propUrl.pathname === "/" || parsed.href.startsWith(prop.replace(/\/$/, ""))) {
          return prop;
        }
      }
    } catch {
      /* skip */
    }
  }

  return sites[0]?.siteUrl ?? null;
}

function pageFilter(pageUrl: string) {
  return {
    dimension: "page",
    operator: "equals",
    expression: pageUrl,
  };
}

function pageFilterContains(pageUrl: string) {
  return {
    dimension: "page",
    operator: "contains",
    expression: pageUrl,
  };
}

/**
 * Busca linha para URL + query exatas.
 */
export async function fetchKeywordPageMetrics(
  accessToken: string,
  siteUrl: string,
  pageUrl: string,
  keyword: string,
  range = getGscDateRange(28),
): Promise<GscSearchRow | null> {
  const normalized = normalizePageUrl(pageUrl);
  const kw = keyword.trim().toLowerCase();

  const run = async (pageExpr: typeof pageFilter) =>
    querySearchAnalytics(accessToken, siteUrl, {
      ...range,
      dimensions: ["query", "page"],
      dimensionFilterGroups: [
        {
          filters: [pageExpr(normalized), { dimension: "query", operator: "equals", expression: kw }],
        },
      ],
      rowLimit: 5,
    });

  let rows = await run(pageFilter);
  if (rows.length === 0) {
    rows = await run(pageFilterContains);
  }

  const match =
    rows.find((r) => r.keys[0]?.toLowerCase() === kw) ??
    rows.find((r) => r.keys[0]?.toLowerCase().includes(kw)) ??
    rows[0];

  return match ?? null;
}

/**
 * Queries que geram impressões para a mesma página.
 */
export async function fetchPageQueries(
  accessToken: string,
  siteUrl: string,
  pageUrl: string,
  range = getGscDateRange(28),
  rowLimit = 25,
): Promise<GscSearchRow[]> {
  const normalized = normalizePageUrl(pageUrl);

  const query = (pageExpr: typeof pageFilter) =>
    querySearchAnalytics(accessToken, siteUrl, {
      ...range,
      dimensions: ["query"],
      dimensionFilterGroups: [{ filters: [pageExpr(normalized)] }],
      rowLimit,
    });

  let rows = await query(pageFilter);
  if (rows.length === 0) {
    rows = await query(pageFilterContains);
  }

  return rows.sort((a, b) => b.impressions - a.impressions);
}

/**
 * Série diária de posição média para URL + query.
 */
export async function fetchPositionHistory(
  accessToken: string,
  siteUrl: string,
  pageUrl: string,
  keyword: string,
  days = 180,
): Promise<{ date: string; position: number | null }[]> {
  const range = getGscDateRange(days);
  const normalized = normalizePageUrl(pageUrl);
  const kw = keyword.trim().toLowerCase();

  const rows = await querySearchAnalytics(accessToken, siteUrl, {
    ...range,
    dimensions: ["date"],
    dimensionFilterGroups: [
      {
        filters: [
          pageFilter(normalized),
          { dimension: "query", operator: "equals", expression: kw },
        ],
      },
    ],
    rowLimit: 250,
  });

  return rows
    .map((r) => ({
      date: r.keys[0] ?? "",
      position: r.impressions > 0 ? Math.round(r.position * 10) / 10 : null,
    }))
    .filter((p) => p.date)
    .sort((a, b) => a.date.localeCompare(b.date));
}
