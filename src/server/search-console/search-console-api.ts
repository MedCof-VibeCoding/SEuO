import "server-only";

import { normalizePageUrl } from "~/features/seo/lib/normalize-page-url";

const GSC_BASE = "https://www.googleapis.com/webmasters/v3";
const URL_INSPECTION_ENDPOINT =
  "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect";

export type GscSite = { siteUrl: string; permissionLevel?: string };

export type GscSearchRow = {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscSitemapEntry = {
  path: string;
  lastSubmitted?: string;
  isPending?: boolean;
  isSitemapsIndex?: boolean;
  type?: string;
  lastDownloaded?: string;
  warnings?: string;
  errors?: string;
};

export type GscUrlInspectionRaw = {
  inspectionResultLink?: string;
  indexStatusResult?: {
    verdict?: string;
    coverageState?: string;
    robotsTxtState?: string;
    indexingState?: string;
    lastCrawlTime?: string;
    pageFetchState?: string;
    googleCanonical?: string;
    userCanonical?: string;
    crawledAs?: string;
    referringUrls?: string[];
  };
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

  return null;
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
 * Totais agregados de cliques, impressões, CTR e posição média para uma página.
 */
export async function fetchPageAggregateMetrics(
  accessToken: string,
  siteUrl: string,
  pageUrl: string,
  range = getGscDateRange(28),
): Promise<{ clicks: number; impressions: number; ctr: number; position: number } | null> {
  const normalized = normalizePageUrl(pageUrl);

  const run = async (pageExpr: typeof pageFilter) => {
    const rows = await querySearchAnalytics(accessToken, siteUrl, {
      ...range,
      dimensionFilterGroups: [{ filters: [pageExpr(normalized)] }],
      rowLimit: 1,
    });
    return rows[0] ?? null;
  };

  let row = await run(pageFilter);
  if (!row) {
    row = await run(pageFilterContains);
  }

  if (!row || row.impressions === 0) return null;

  return {
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: row.ctr,
    position: row.position,
  };
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

/**
 * Distribuição de audiência por país (Search Analytics).
 */
export async function fetchPageCountryBreakdown(
  accessToken: string,
  siteUrl: string,
  pageUrl: string,
  range = getGscDateRange(28),
  rowLimit = 15,
): Promise<GscSearchRow[]> {
  return fetchDimensionBreakdown(accessToken, siteUrl, pageUrl, "country", range, rowLimit);
}

/**
 * Distribuição de audiência por dispositivo (mobile/desktop/tablet).
 */
export async function fetchPageDeviceBreakdown(
  accessToken: string,
  siteUrl: string,
  pageUrl: string,
  range = getGscDateRange(28),
  rowLimit = 5,
): Promise<GscSearchRow[]> {
  return fetchDimensionBreakdown(accessToken, siteUrl, pageUrl, "device", range, rowLimit);
}

/**
 * Páginas do site com mais impressões (proxy de URLs servindo na busca).
 */
export async function fetchTopPages(
  accessToken: string,
  siteUrl: string,
  range = getGscDateRange(28),
  rowLimit = 20,
): Promise<GscSearchRow[]> {
  const rows = await querySearchAnalytics(accessToken, siteUrl, {
    ...range,
    dimensions: ["page"],
    rowLimit,
  });
  return rows.sort((a, b) => b.impressions - a.impressions);
}

/**
 * Lista sitemaps enviados e status de leitura no Search Console.
 */
export async function listSitemaps(
  accessToken: string,
  siteUrl: string,
): Promise<GscSitemapEntry[]> {
  const encodedSite = encodeURIComponent(siteUrl);
  const res = await fetch(`${GSC_BASE}/sites/${encodedSite}/sitemaps`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new SearchConsoleApiError(res.status, err);
  }
  const data = (await res.json()) as { sitemap?: GscSitemapEntry[] };
  return data.sitemap ?? [];
}

/**
 * Inspeção individual de URL (indexação, canônicos, robots, crawl).
 */
export async function inspectUrl(
  accessToken: string,
  siteUrl: string,
  inspectionUrl: string,
): Promise<GscUrlInspectionRaw> {
  const res = await fetch(URL_INSPECTION_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inspectionUrl: normalizePageUrl(inspectionUrl),
      siteUrl,
      languageCode: "pt-BR",
    }),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new SearchConsoleApiError(res.status, err);
  }

  const data = (await res.json()) as {
    inspectionResult?: GscUrlInspectionRaw;
  };
  return data.inspectionResult ?? {};
}

async function fetchDimensionBreakdown(
  accessToken: string,
  siteUrl: string,
  pageUrl: string,
  dimension: "country" | "device",
  range: { startDate: string; endDate: string },
  rowLimit: number,
): Promise<GscSearchRow[]> {
  const normalized = normalizePageUrl(pageUrl);

  const run = async (pageExpr: typeof pageFilter) =>
    querySearchAnalytics(accessToken, siteUrl, {
      ...range,
      dimensions: [dimension],
      dimensionFilterGroups: [{ filters: [pageExpr(normalized)] }],
      rowLimit,
    });

  let rows = await run(pageFilter);
  if (rows.length === 0) {
    rows = await run(pageFilterContains);
  }
  return rows.sort((a, b) => b.impressions - a.impressions);
}
