import "server-only";

import { normalizePageUrl } from "~/features/seo/lib/normalize-page-url";
import type {
  ComparativeSearchConsoleData,
  GscAudienceBreakdownItem,
  GscPageVisibilityItem,
  GscSecurityData,
  GscSitemapStatus,
  GscUrlInspectionData,
  SearchConsoleQueryMetric,
} from "~/features/seo/types/analysis";
import {
  fetchKeywordPageMetrics,
  fetchPageAggregateMetrics,
  fetchPageCountryBreakdown,
  fetchPageDeviceBreakdown,
  fetchPageQueries,
  fetchPositionHistory,
  fetchTopPages,
  inspectUrl,
  listGscSites,
  listSitemaps,
  resolveGscProperty,
  type GscSearchRow,
  type GscSitemapEntry,
  type GscUrlInspectionRaw,
} from "~/server/search-console/search-console-api";

const COUNTRY_LABELS: Record<string, string> = {
  bra: "Brasil",
  usa: "Estados Unidos",
  prt: "Portugal",
  arg: "Argentina",
  mex: "México",
  col: "Colômbia",
  chl: "Chile",
  per: "Peru",
  esp: "Espanha",
  gbr: "Reino Unido",
  deu: "Alemanha",
  fra: "França",
  ita: "Itália",
  can: "Canadá",
  ago: "Angola",
  moz: "Moçambique",
};

const DEVICE_LABELS: Record<string, string> = {
  MOBILE: "Celular",
  DESKTOP: "Computador",
  TABLET: "Tablet",
};

function mapQueryRow(row: GscSearchRow): SearchConsoleQueryMetric {
  const keyword = row.keys[0] ?? "";
  return {
    keyword,
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 1000) / 10,
    position: row.impressions > 0 ? Math.max(1, Math.round(row.position)) : null,
  };
}

function mapAudienceRow(
  row: GscSearchRow,
  labelMap: Record<string, string>,
): GscAudienceBreakdownItem {
  const key = (row.keys[0] ?? "").toUpperCase();
  const labelKey = key.toLowerCase();
  return {
    key,
    label: labelMap[key] ?? labelMap[labelKey] ?? (key || "Desconhecido"),
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 1000) / 10,
    position: row.impressions > 0 ? Math.max(1, Math.round(row.position)) : null,
  };
}

function mapPageRow(row: GscSearchRow): GscPageVisibilityItem {
  return {
    url: row.keys[0] ?? "",
    clicks: row.clicks,
    impressions: row.impressions,
    ctr: Math.round(row.ctr * 1000) / 10,
    position: row.impressions > 0 ? Math.max(1, Math.round(row.position)) : null,
  };
}

function mapSitemap(entry: GscSitemapEntry): GscSitemapStatus {
  return {
    path: entry.path,
    lastSubmitted: entry.lastSubmitted,
    lastDownloaded: entry.lastDownloaded,
    isPending: Boolean(entry.isPending),
    isSitemapsIndex: Boolean(entry.isSitemapsIndex),
    type: entry.type,
    warnings: Number(entry.warnings ?? 0),
    errors: Number(entry.errors ?? 0),
  };
}

/**
 * Converte resposta da URL Inspection API para o formato do relatório.
 */
function mapUrlInspection(
  inspectionUrl: string,
  raw: GscUrlInspectionRaw | null,
  error?: string,
): GscUrlInspectionData {
  if (error || !raw) {
    return {
      inspectionUrl,
      referringUrls: [],
      available: false,
      error: error ?? "Inspeção indisponível.",
    };
  }

  const index = raw.indexStatusResult;
  return {
    inspectionUrl,
    coverageState: index?.coverageState,
    indexingState: index?.indexingState,
    robotsTxtState: index?.robotsTxtState,
    pageFetchState: index?.pageFetchState,
    lastCrawlTime: index?.lastCrawlTime,
    googleCanonical: index?.googleCanonical,
    userCanonical: index?.userCanonical,
    crawledAs: index?.crawledAs,
    verdict: index?.verdict,
    referringUrls: index?.referringUrls ?? [],
    inspectionResultLink: raw.inspectionResultLink,
    available: true,
  };
}

/**
 * Deriva alertas de segurança a partir da inspeção (API pública não lista malware do site).
 */
function buildSecurityFromInspection(inspection?: GscUrlInspectionData): GscSecurityData {
  if (!inspection?.available) {
    return {
      status: "unavailable",
      issues: [],
      note: "A API pública do Search Console não expõe a lista de problemas de segurança do site (malware, hackeamento). Verifique em Search Console → Segurança e ações manuais. Sinais de crawl da URL inspecionada também não estavam disponíveis.",
    };
  }

  const issues: GscSecurityData["issues"] = [];
  const fetchState = inspection.pageFetchState?.toUpperCase() ?? "";
  const coverage = inspection.coverageState?.toLowerCase() ?? "";

  if (fetchState.includes("SOFT_404") || coverage.includes("soft 404")) {
    issues.push({
      type: "soft_404",
      detail: "A URL responde como soft 404 — risco de página vazia ou conteúdo removido.",
    });
  }
  if (fetchState.includes("SERVER_ERROR") || fetchState.includes("5XX")) {
    issues.push({
      type: "server_error",
      detail: "Falha de servidor no último crawl — pode indicar página comprometida ou indisponível.",
    });
  }
  if (fetchState.includes("ACCESS_DENIED") || fetchState.includes("BLOCKED")) {
    issues.push({
      type: "access_blocked",
      detail: "Google não conseguiu acessar a página (bloqueio ou autenticação).",
    });
  }
  if (inspection.robotsTxtState?.toUpperCase().includes("DISALLOWED")) {
    issues.push({
      type: "robots_blocked",
      detail: "robots.txt bloqueia o rastreamento desta URL.",
    });
  }

  if (issues.length > 0) {
    return {
      status: "issues_found",
      issues,
      note: "Alertas derivados da inspeção desta URL. Para malware/hackeamento em escala de site, confira Segurança e ações manuais no Search Console.",
    };
  }

  return {
    status: "clear",
    issues: [],
    note: "Nenhum sinal crítico na inspeção desta URL. A API não lista invasões/malware do domínio — confirme em Search Console → Segurança e ações manuais.",
  };
}

function buildInsight(
  totals: ComparativeSearchConsoleData["totals"],
  mainKeyword?: string,
  mainMetrics?: SearchConsoleQueryMetric | null,
  inspection?: GscUrlInspectionData,
): string {
  const parts: string[] = [];

  if (totals.impressions === 0) {
    parts.push(
      "Nenhuma impressão registrada no Search Console para esta URL nos últimos 28 dias. Verifique indexação e links internos.",
    );
  } else if (mainMetrics?.position) {
    if (mainMetrics.position <= 10) {
      parts.push(
        `A palavra-chave “${mainKeyword}” está na posição média #${mainMetrics.position} com ${mainMetrics.clicks} cliques e ${mainMetrics.impressions} impressões (28d).`,
      );
    } else {
      parts.push(
        `“${mainKeyword}” acumula ${mainMetrics.impressions} impressões, mas a posição média (#${mainMetrics.position}) ainda pode melhorar no título e no H1.`,
      );
    }
  } else if (totals.averagePosition !== null && totals.averagePosition <= 10) {
    parts.push(
      `Bom desempenho orgânico: posição média #${totals.averagePosition}, ${totals.clicks} cliques e ${totals.impressions} impressões nos últimos 28 dias.`,
    );
  } else {
    parts.push(
      `A URL gerou ${totals.impressions} impressões e ${totals.clicks} cliques nos últimos 28 dias. Revise as queries principais abaixo para priorizar otimizações.`,
    );
  }

  if (inspection?.available && inspection.coverageState) {
    parts.push(`Indexação (inspeção): ${inspection.coverageState}.`);
  }

  return parts.join(" ");
}

/**
 * Monta dados do Search Console para enriquecer a análise comparativa da URL alvo.
 */
export async function buildComparativeSearchConsoleData(
  accessToken: string,
  rawTargetUrl: string,
  options?: { mainKeyword?: string; aiKeywords?: string[] },
): Promise<ComparativeSearchConsoleData> {
  const targetUrl = normalizePageUrl(rawTargetUrl);
  const mainKeyword = options?.mainKeyword?.trim().toLowerCase();
  const checkedAt = new Date().toISOString();

  const sites = await listGscSites(accessToken);
  const property = resolveGscProperty(targetUrl, sites);

  if (!property) {
    return {
      connected: true,
      available: false,
      targetUrl,
      mainKeyword,
      topQueries: [],
      totals: { clicks: 0, impressions: 0, ctr: 0, averagePosition: null },
      insight:
        "Esta URL não pertence a nenhuma propriedade verificada no seu Google Search Console.",
      checkedAt,
    };
  }

  const [pageRows, aggregate, mainRow, countryRows, deviceRows, topPageRows, sitemapEntries] =
    await Promise.all([
      fetchPageQueries(accessToken, property, targetUrl, undefined, 20),
      fetchPageAggregateMetrics(accessToken, property, targetUrl),
      mainKeyword
        ? fetchKeywordPageMetrics(accessToken, property, targetUrl, mainKeyword)
        : Promise.resolve(null),
      fetchPageCountryBreakdown(accessToken, property, targetUrl).catch(() => [] as GscSearchRow[]),
      fetchPageDeviceBreakdown(accessToken, property, targetUrl).catch(() => [] as GscSearchRow[]),
      fetchTopPages(accessToken, property, undefined, 15).catch(() => [] as GscSearchRow[]),
      listSitemaps(accessToken, property).catch(() => [] as GscSitemapEntry[]),
    ]);

  let urlInspection: GscUrlInspectionData;
  try {
    const raw = await inspectUrl(accessToken, property, targetUrl);
    urlInspection = mapUrlInspection(targetUrl, raw);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Falha na inspeção de URL.";
    urlInspection = mapUrlInspection(targetUrl, null, message);
  }

  const topQueries = pageRows.map(mapQueryRow);

  let mainKeywordMetrics: SearchConsoleQueryMetric | null = null;
  if (mainKeyword) {
    if (mainRow) {
      mainKeywordMetrics = mapQueryRow(mainRow);
    } else {
      mainKeywordMetrics =
        topQueries.find((q) => q.keyword.toLowerCase() === mainKeyword) ?? null;
    }
  } else if (topQueries[0]) {
    mainKeywordMetrics = topQueries[0];
  }

  const totals = {
    clicks: aggregate?.clicks ?? topQueries.reduce((s, q) => s + q.clicks, 0),
    impressions: aggregate?.impressions ?? topQueries.reduce((s, q) => s + q.impressions, 0),
    ctr: aggregate
      ? Math.round(aggregate.ctr * 1000) / 10
      : totalsCtrFromQueries(topQueries),
    averagePosition:
      aggregate && aggregate.impressions > 0
        ? Math.max(1, Math.round(aggregate.position))
        : averagePositionFromQueries(topQueries),
  };

  const resolvedMainKeyword = mainKeyword ?? mainKeywordMetrics?.keyword;
  let positionHistory: ComparativeSearchConsoleData["positionHistory"];
  if (resolvedMainKeyword) {
    const history = await fetchPositionHistory(
      accessToken,
      property,
      targetUrl,
      resolvedMainKeyword,
      90,
    );
    positionHistory =
      history.length > 0
        ? history.map((p) => ({
            date: new Date(p.date).toISOString(),
            position: p.position,
          }))
        : undefined;
  }

  const countries = countryRows.map((row) => mapAudienceRow(row, COUNTRY_LABELS));
  const devices = deviceRows.map((row) => mapAudienceRow(row, DEVICE_LABELS));
  const sitemaps = sitemapEntries.map(mapSitemap);
  const pagesServingInSearch = topPageRows.map(mapPageRow);

  const security = buildSecurityFromInspection(urlInspection);

  return {
    connected: true,
    available: true,
    gscProperty: property,
    targetUrl,
    mainKeyword: resolvedMainKeyword,
    mainKeywordMetrics,
    topQueries,
    totals,
    positionHistory,
    countries,
    devices,
    sitemaps,
    urlInspection,
    indexCoverage: {
      targetInspection: urlInspection,
      pagesServingInSearch,
      note: "A API pública não lista todas as páginas não indexadas com motivos. Abaixo: inspeção da URL alvo (cobertura, robots, fetch) e páginas com impressões (servindo na busca). Motivos como 404, noindex e robots.txt aparecem na inspeção quando aplicáveis.",
    },
    links: {
      inboundReferringUrls: urlInspection.referringUrls.slice(0, 20),
      topInternalPages: pagesServingInSearch,
      note: "Links externos por domínio de origem não estão na API pública do GSC. Exibimos URLs de referência da inspeção e páginas internas com mais impressões (visibilidade orgânica).",
    },
    security,
    insight: buildInsight(totals, resolvedMainKeyword, mainKeywordMetrics, urlInspection),
    checkedAt,
  };
}

function totalsCtrFromQueries(queries: SearchConsoleQueryMetric[]): number {
  const impressions = queries.reduce((s, q) => s + q.impressions, 0);
  const clicks = queries.reduce((s, q) => s + q.clicks, 0);
  if (impressions === 0) return 0;
  return Math.round((clicks / impressions) * 1000) / 10;
}

function averagePositionFromQueries(queries: SearchConsoleQueryMetric[]): number | null {
  const ranked = queries.filter((q) => q.position !== null && q.impressions > 0);
  if (ranked.length === 0) return null;
  const weighted = ranked.reduce(
    (acc, q) => ({
      sum: acc.sum + (q.position ?? 0) * q.impressions,
      impressions: acc.impressions + q.impressions,
    }),
    { sum: 0, impressions: 0 },
  );
  if (weighted.impressions === 0) return null;
  return Math.max(1, Math.round(weighted.sum / weighted.impressions));
}

/**
 * Estado padrão quando o usuário não está conectado ao Search Console.
 */
export function buildDisconnectedSearchConsoleData(
  targetUrl: string,
  mainKeyword?: string,
): ComparativeSearchConsoleData {
  return {
    connected: false,
    available: false,
    targetUrl,
    mainKeyword,
    topQueries: [],
    totals: { clicks: 0, impressions: 0, ctr: 0, averagePosition: null },
    insight:
      "Entre com Google para incluir desempenho, audiência, indexação, sitemaps e inspeção de URL do Search Console.",
    checkedAt: new Date().toISOString(),
  };
}
