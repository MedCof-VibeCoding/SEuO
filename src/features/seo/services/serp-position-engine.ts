import type {
  DomainAnalysis,
  SerpKeywordRanking,
  SerpPositionAnalysis,
  SerpResultType,
} from "~/features/seo/types/analysis";

const KEYWORD_TEMPLATES = [
  "{domain} review",
  "melhor {topic}",
  "{topic} guia completo",
  "como fazer {topic}",
  "{topic} ferramentas",
  "{topic} vs concorrente",
  "o que é {topic}",
];

function hashSeed(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function pickKeywords(domain: string): string[] {
  const topic = domain.replace(/\.(com|com\.br|net|org).*$/, "").replace(/[-.]/g, " ");
  const seed = hashSeed(domain);
  return KEYWORD_TEMPLATES.slice(0, 5).map((tpl, i) => {
    const kw = tpl.replace("{domain}", domain).replace("{topic}", topic || "seo");
    return i === 0 && seed % 2 === 0 ? kw : kw;
  });
}

function positionFromScore(score: number, seed: number): number | null {
  if (score < 35) return null;
  const base = Math.max(1, Math.round(22 - score / 4.5));
  const jitter = (seed % 7) - 3;
  const pos = base + jitter;
  if (pos > 50) return null;
  return Math.max(1, pos);
}

function resultTypeForPosition(pos: number | null, seed: number): SerpResultType {
  if (pos === null) return "not_ranking";
  if (pos === 1 && seed % 5 === 0) return "featured_snippet";
  if (pos <= 3 && seed % 4 === 0) return "ai_overview";
  if (pos <= 10 && seed % 3 === 0) return "people_also_ask";
  return "organic";
}

/**
 * Simula posicionamento orgânico no Google por palavra-chave (benchmark editorial).
 */
export function buildSerpPositionAnalysis(
  primaryDomain: string,
  competitors: string[],
  domains: DomainAnalysis[],
): SerpPositionAnalysis {
  const primary = domains.find((d) => d.role === "primary");
  const score = primary?.overallScore ?? 50;
  const seed = hashSeed(primaryDomain);
  const keywords = pickKeywords(primaryDomain);

  const trackedKeywords: SerpKeywordRanking[] = keywords.map((keyword, i) => {
    const kwSeed = hashSeed(keyword + primaryDomain);
    const primaryPosition = positionFromScore(score - i * 4, kwSeed);
    const trends: SerpKeywordRanking["trend"][] = ["up", "down", "stable"];
    const competitorPositions = competitors.map((domain, ci) => {
      const comp = domains.find((d) => d.domain === domain);
      const compScore = comp?.overallScore ?? 55 + ci * 3;
      return {
        domain,
        position: positionFromScore(compScore - i * 2, hashSeed(domain + keyword)),
      };
    });

    const volumeBands = ["880/mês", "1.2k/mês", "2.4k/mês", "590/mês", "3.1k/mês"];
    const clicks =
      primaryPosition === null
        ? 0
        : primaryPosition === 1
          ? Math.round(420 + (kwSeed % 80))
          : Math.round(180 / primaryPosition + (kwSeed % 40));

    return {
      keyword,
      searchVolumeLabel: volumeBands[i % volumeBands.length] ?? "1k/mês",
      primaryPosition,
      primaryUrl: primaryPosition
        ? `https://${primaryDomain}/${keyword.split(" ")[0]?.toLowerCase() ?? "pagina"}`
        : `https://${primaryDomain}/`,
      primaryResultType: resultTypeForPosition(primaryPosition, kwSeed),
      competitorPositions,
      trend: trends[kwSeed % 3]!,
      estimatedMonthlyClicks: clicks,
    };
  });

  const ranked = trackedKeywords.filter((k) => k.primaryPosition !== null);
  const averagePosition =
    ranked.length > 0
      ? Math.round(
          (ranked.reduce((s, k) => s + (k.primaryPosition ?? 0), 0) / ranked.length) * 10,
        ) / 10
      : null;

  const top10 = trackedKeywords.filter(
    (k) => k.primaryPosition !== null && k.primaryPosition <= 10,
  ).length;
  const visibilityScore = Math.min(
    100,
    Math.round((top10 / trackedKeywords.length) * 55 + score * 0.35),
  );

  const bestKw = trackedKeywords.reduce<SerpKeywordRanking | null>((best, k) => {
    if (k.primaryPosition === null) return best;
    if (!best || (best.primaryPosition ?? 99) > k.primaryPosition) return k;
    return best;
  }, null);

  const insight =
    averagePosition === null
      ? `O domínio ${primaryDomain} não aparece no top 50 para as palavras monitoradas. Priorize conteúdo informativo e backlinks para ganhar visibilidade.`
      : averagePosition <= 5
        ? `Posição média ${averagePosition} — forte presença orgânica. "${bestKw?.keyword ?? keywords[0]}" na posição ${bestKw?.primaryPosition} é seu principal tráfego.`
        : `Posição média ${averagePosition}. Há espaço para subir no Google otimizando títulos, snippets e profundidade semântica do conteúdo.`;

  return {
    trackedKeywords,
    averagePosition,
    visibilityScore,
    keywordsInTop10: top10,
    keywordsTracked: trackedKeywords.length,
    primaryDomainShare: Math.round((top10 / trackedKeywords.length) * 100),
    serpFeatures: [
      {
        feature: "AI Overview",
        present: score > 60 && seed % 2 === 0,
        holderDomain: competitors[0] ?? primaryDomain,
      },
      {
        feature: "Featured Snippet",
        present: bestKw?.primaryResultType === "featured_snippet",
        holderDomain:
          bestKw?.primaryResultType === "featured_snippet" ? primaryDomain : (competitors[0] ?? "outro site"),
      },
      {
        feature: "People Also Ask",
        present: true,
        holderDomain: primaryDomain,
      },
      {
        feature: "Sitelinks",
        present: score > 70,
        holderDomain: primaryDomain,
      },
    ],
    insight,
    lastChecked: new Date().toISOString(),
    mainKeyword: keywords[0] ?? primaryDomain,
  };
}
