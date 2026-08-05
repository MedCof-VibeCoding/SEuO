import type { GooglePositionCheckResult } from "~/features/seo/types/google-position-check";
import { normalizePageUrl } from "~/features/seo/lib/normalize-page-url";
import {
  deriveKeywordFromUrl,
  getRankTier,
} from "~/features/seo/services/google-position-check-engine";
import {
  fetchKeywordPageMetrics,
  fetchPageQueries,
  fetchPositionHistory,
  listGscSites,
  resolveGscProperty,
  type GscSearchRow,
} from "~/server/search-console/search-console-api";

function impressionsLabel(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k impressões`;
  return `${n} impressões (28d)`;
}

function clicksLabel(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k cliques`;
  return `${n} cliques (28d)`;
}

function competitionFromImpressions(impressions: number): GooglePositionCheckResult["competition"] {
  if (impressions < 80) return "low";
  if (impressions < 400) return "medium";
  return "high";
}

function seoScoreFromMetrics(position: number | null, ctr: number, impressions: number): number {
  if (impressions === 0 || position === null) return Math.min(40, 15 + Math.round(impressions / 10));
  const posScore = Math.max(0, 100 - position * 2.2);
  const ctrScore = Math.min(30, ctr * 300);
  return Math.min(98, Math.round(posScore * 0.7 + ctrScore));
}

function buildTitleFromUrl(pageUrl: string, keyword: string): string {
  try {
    const path = new URL(pageUrl).pathname;
    const slug = path.split("/").filter(Boolean).pop()?.replace(/-/g, " ");
    if (slug) {
      return `${slug.charAt(0).toUpperCase()}${slug.slice(1)} | ${keyword}`;
    }
  } catch {
    /* ignore */
  }
  return keyword.charAt(0).toUpperCase() + keyword.slice(1);
}

function mapRelatedRows(
  rows: GscSearchRow[],
  primaryKeyword: string,
  primaryRow: GscSearchRow | null,
): GooglePositionCheckResult["relatedKeywords"] {
  const kw = primaryKeyword.toLowerCase();
  const maxImp = Math.max(1, ...rows.map((r) => r.impressions), primaryRow?.impressions ?? 0);

  const mapped = rows.map((row) => {
    const keyword = row.keys[0] ?? "";
    const position =
      row.impressions > 0 ? Math.max(1, Math.round(row.position)) : null;
    return {
      keyword,
      position,
      rankTier: getRankTier(position),
      searchVolumeLabel: impressionsLabel(row.impressions),
      clicks: row.clicks,
      clicksLabel: clicksLabel(row.clicks),
      relevanceScore: Math.min(100, Math.round((row.impressions / maxImp) * 100)),
      isPrimary: keyword.toLowerCase() === kw,
    };
  });

  const hasPrimary = mapped.some((r) => r.isPrimary);
  if (!hasPrimary) {
    const pos =
      primaryRow && primaryRow.impressions > 0
        ? Math.max(1, Math.round(primaryRow.position))
        : null;
    mapped.unshift({
      keyword: primaryKeyword,
      position: pos,
      rankTier: getRankTier(pos),
      searchVolumeLabel: primaryRow
        ? impressionsLabel(primaryRow.impressions)
        : "0 impressões (28d)",
      clicks: primaryRow?.clicks ?? 0,
      clicksLabel: primaryRow ? clicksLabel(primaryRow.clicks) : clicksLabel(0),
      relevanceScore: 100,
      isPrimary: true,
    });
  }

  return mapped.sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    if (a.position === null && b.position === null) return b.relevanceScore - a.relevanceScore;
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return a.position - b.position;
  });
}

/**
 * Monta resultado do Position Checker a partir do Google Search Console.
 */
export async function buildGooglePositionFromSearchConsole(
  accessToken: string,
  rawUrl: string,
  keyword?: string,
): Promise<GooglePositionCheckResult> {
  const url = normalizePageUrl(rawUrl);
  const kwInput = keyword?.trim().toLowerCase() ?? "";

  const sites = await listGscSites(accessToken);
  const property = resolveGscProperty(url, sites);
  if (!property) {
    throw new Error("GSC_PROPERTY_NOT_FOUND");
  }

  const pageRows = await fetchPageQueries(accessToken, property, url);

  let kw: string;
  let primaryRow: GscSearchRow | null;
  const keywordAutoDetected = !kwInput;

  if (kwInput) {
    kw = kwInput;
    primaryRow = await fetchKeywordPageMetrics(accessToken, property, url, kw);
    if (!primaryRow) {
      primaryRow =
        pageRows.find((row) => row.keys[0]?.toLowerCase() === kw) ?? null;
    }
  } else {
    const topRow = pageRows[0];
    if (topRow?.keys[0]) {
      kw = topRow.keys[0].toLowerCase();
      primaryRow = topRow;
    } else {
      kw = deriveKeywordFromUrl(url);
      primaryRow = null;
    }
  }

  const history = await fetchPositionHistory(accessToken, property, url, kw);

  const position =
    primaryRow && primaryRow.impressions > 0
      ? Math.max(1, Math.round(primaryRow.position))
      : null;
  const found = position !== null && position <= 100;
  const impressions = primaryRow?.impressions ?? 0;
  const clicks = primaryRow?.clicks ?? 0;
  const ctr = primaryRow?.ctr ?? 0;
  const competition = competitionFromImpressions(impressions);

  const suggestion = !found
    ? keywordAutoDetected
      ? "Nenhuma query registrada no Search Console para esta URL nos últimos 28 dias. Verifique indexação, sitemap e links internos."
      : "Esta página não acumulou impressões no Search Console para esta palavra-chave nos últimos 28 dias. Revise o conteúdo, indexação e links internos."
    : position! <= 10
      ? keywordAutoDetected
        ? `A query com mais impressões para esta URL é “${kw}”. Bom desempenho — mantenha o conteúdo atualizado e monitore o CTR.`
        : "Bom desempenho no Search Console. Mantenha o conteúdo atualizado e monitore CTR no relatório de performance."
      : keywordAutoDetected
        ? `A query principal detectada é “${kw}”. Reforce esse termo no título, H1 e trechos iniciais para melhorar a posição média.`
        : "Há impressões, mas a posição média pode melhorar. Reforce a palavra-chave no título, H1 e trechos iniciais.";

  return {
    url,
    keyword: kw,
    keywordAutoDetected,
    position: found ? position : null,
    rankTier: getRankTier(position),
    found,
    pageTitle: buildTitleFromUrl(url, kw),
    metaDescription: `Dados reais do Google Search Console para "${kw}" nesta URL (últimos 28 dias).`,
    foundUrl: url,
    checkedAt: new Date().toISOString(),
    searchVolume: impressions,
    searchVolumeLabel: impressionsLabel(impressions),
    clicks,
    clicksLabel: clicksLabel(clicks),
    competition,
    competitionLabel:
      competition === "low" ? "Baixa" : competition === "medium" ? "Média" : "Alta",
    estimatedCtr: Math.round(ctr * 1000) / 10,
    seoScore: seoScoreFromMetrics(position, ctr, impressions),
    rankingHistory:
      history.length > 0
        ? history.map((p) => ({
            date: new Date(p.date).toISOString(),
            position: p.position,
          }))
        : [{ date: new Date().toISOString(), position }],
    relatedKeywords: mapRelatedRows(pageRows, kw, primaryRow),
    suggestion,
    dataSource: "search_console",
    gscProperty: property,
  };
}
