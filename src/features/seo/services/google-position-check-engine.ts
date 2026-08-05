import { normalizePageUrl } from "~/features/seo/lib/normalize-page-url";
import type {
  GooglePositionCheckResult,
  GoogleRankTier,
  RankingHistoryPoint,
  RelatedRankingKeyword,
} from "~/features/seo/types/google-position-check";

/**
 * Extrai palavra-chave provável a partir do slug da URL (fallback sem keyword).
 */
export function deriveKeywordFromUrl(pageUrl: string): string {
  try {
    const path = new URL(pageUrl).pathname;
    const slug = path.split("/").filter(Boolean).pop()?.replace(/-/g, " ");
    if (slug && slug.length >= 2) return slug.toLowerCase();
  } catch {
    /* ignore */
  }
  return "consulta orgânica";
}

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

/**
 * Define badge de ranking conforme posição orgânica.
 */
export function getRankTier(position: number | null): GoogleRankTier {
  if (position === null || position > 50) return "not_ranking";
  if (position <= 3) return "top_3";
  if (position <= 10) return "top_10";
  return "top_50";
}

function competitionFromSeed(seed: number): GooglePositionCheckResult["competition"] {
  const bands: GooglePositionCheckResult["competition"][] = ["low", "medium", "high"];
  return bands[seed % 3]!;
}

function formatVolume(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k/mês`;
  return `${n}/mês`;
}

function formatClicks(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k cliques`;
  return `${n} cliques (28d)`;
}

function buildTitle(keyword: string, hostname: string): string {
  const cap = keyword.charAt(0).toUpperCase() + keyword.slice(1);
  return `${cap} — Guia completo | ${hostname}`;
}

function buildMeta(keyword: string): string {
  return `Descubra tudo sobre ${keyword}: estratégias, ferramentas e dicas práticas para ranquear no Google. Conteúdo atualizado para SEO e GEO.`;
}

function buildRankingHistory(
  current: number | null,
  seed: number,
): RankingHistoryPoint[] {
  const months = 6;
  const points: RankingHistoryPoint[] = [];
  const now = new Date();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setMonth(d.getMonth() - i);
    if (current === null) {
      points.push({ date: d.toISOString(), position: null });
      continue;
    }
    const drift = ((seed + i * 17) % 11) - 5;
    const pos = Math.max(1, Math.min(100, current + drift + i - 2));
    points.push({ date: d.toISOString(), position: pos });
  }
  points[points.length - 1] = { date: now.toISOString(), position: current };
  return points;
}

const RELATED_TEMPLATES = [
  "{kw}",
  "como fazer {kw}",
  "melhor {kw}",
  "{kw} guia completo",
  "{kw} passo a passo",
  "o que é {kw}",
  "{kw} ferramentas",
  "{kw} para iniciantes",
  "{kw} 2025",
  "curso de {kw}",
];

function buildRelatedKeywords(
  primaryKw: string,
  primaryPosition: number | null,
  url: string,
  seed: number,
): RelatedRankingKeyword[] {
  const count = 6 + (seed % 3);
  const seen = new Set<string>();
  const items: RelatedRankingKeyword[] = [];

  for (let i = 0; i < RELATED_TEMPLATES.length && items.length < count; i++) {
    const tpl = RELATED_TEMPLATES[i]!;
    const keyword = tpl.replace(/\{kw\}/g, primaryKw).trim();
    if (seen.has(keyword)) continue;
    seen.add(keyword);

    const kwSeed = hashSeed(url + keyword);
    const isPrimary = keyword === primaryKw;

    let position: number | null;
    if (isPrimary) {
      position = primaryPosition;
    } else {
      const roll = (kwSeed + i * 13) % 100;
      if (roll < 22) position = null;
      else if (roll < 45) position = 12 + (kwSeed % 38);
      else if (roll < 70) position = 4 + (kwSeed % 7);
      else position = 1 + (kwSeed % 5);
    }

    const volume = 180 + (kwSeed % 6200);
    const ctr = estimateCtr(position);
    const clicks = position !== null ? Math.max(1, Math.round(volume * (ctr / 100))) : 0;
    items.push({
      keyword,
      position,
      rankTier: getRankTier(position),
      searchVolumeLabel: formatVolume(volume),
      clicks,
      clicksLabel: formatClicks(clicks),
      relevanceScore: isPrimary
        ? 100
        : Math.min(96, 55 + (kwSeed % 42) + (position !== null && position <= 20 ? 12 : 0)),
      isPrimary,
    });
  }

  return items.sort((a, b) => {
    if (a.isPrimary) return -1;
    if (b.isPrimary) return 1;
    if (a.position === null && b.position === null) return b.relevanceScore - a.relevanceScore;
    if (a.position === null) return 1;
    if (b.position === null) return -1;
    return a.position - b.position;
  });
}

function estimateCtr(position: number | null): number {
  if (position === null) return 0;
  const table: Record<number, number> = {
    1: 28.5,
    2: 15.2,
    3: 11.1,
    4: 8.4,
    5: 6.3,
    6: 4.9,
    7: 3.8,
    8: 3.1,
    9: 2.6,
    10: 2.1,
  };
  if (position <= 10) return table[position] ?? 2;
  return Math.max(0.3, 2.1 - position * 0.04);
}

/**
 * Simula consulta SERP: posição da URL para uma palavra-chave (pronto para SerpAPI / GSC).
 */
export function buildGooglePositionCheck(
  rawUrl: string,
  keyword?: string,
): GooglePositionCheckResult {
  const url = normalizePageUrl(rawUrl);
  const kw = keyword?.trim() ? keyword.trim().toLowerCase() : deriveKeywordFromUrl(url);
  const seed = hashSeed(url + "|" + kw);
  const hostname = (() => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return "site.com";
    }
  })();

  const rankChance = seed % 100;
  let position: number | null;

  if (rankChance < 18) {
    position = null;
  } else if (rankChance < 35) {
    position = 8 + (seed % 43);
  } else if (rankChance < 55) {
    position = 4 + (seed % 7);
  } else if (rankChance < 75) {
    position = 1 + (seed % 3);
  } else {
    position = 11 + (seed % 40);
  }

  if (position !== null && position > 100) position = null;

  const found = position !== null && position <= 100;
  const rankTier = getRankTier(position);
  const searchVolume = 320 + (seed % 4800);
  const estimatedCtr = estimateCtr(position);
  const clicks = found
    ? Math.max(1, Math.round(searchVolume * (estimatedCtr / 100)))
    : Math.round(seed % 40);
  const competition = competitionFromSeed(seed);
  const competitionLabels = { low: "Baixa", medium: "Média", high: "Alta" };
  const seoScore = found
    ? Math.min(98, Math.round(88 - (position ?? 50) * 0.9 + (seed % 12)))
    : Math.round(28 + (seed % 35));

  const suggestion = !found
    ? "Melhore o SEO desta página adicionando mais conteúdo relacionado à palavra-chave, links internos e um title tag otimizado."
    : position! <= 10
      ? "Você já está no top 10. Reforce E-E-A-T, atualize o conteúdo e capture featured snippets para subir ao top 3."
      : "Melhore o SEO desta página adicionando mais conteúdo relacionado à palavra-chave, headings semânticos e backlinks de qualidade.";

  return {
    dataSource: "mock",
    url,
    keyword: kw,
    keywordAutoDetected: !keyword?.trim(),
    position: found ? position : null,
    rankTier,
    found,
    pageTitle: buildTitle(kw, hostname),
    metaDescription: buildMeta(kw),
    foundUrl: found ? url : url,
    checkedAt: new Date().toISOString(),
    searchVolume,
    searchVolumeLabel: formatVolume(searchVolume),
    clicks,
    clicksLabel: formatClicks(clicks),
    competition,
    competitionLabel: competitionLabels[competition],
    estimatedCtr,
    seoScore,
    rankingHistory: buildRankingHistory(found ? position : null, seed),
    relatedKeywords: buildRelatedKeywords(kw, found ? position : null, url, seed),
    suggestion,
  };
}
