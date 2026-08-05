import "server-only";

import { parseHtmlSignals } from "~/features/seo/lib/html-parser";
import {
  buildComparativeSearchConsoleData,
  buildDisconnectedSearchConsoleData,
} from "~/features/seo/services/comparative-search-console";
import type {
  HtmlSeoAnalysisResult,
  HtmlSeoContentRelevance,
  HtmlSeoElements,
  HtmlSeoKeyword,
  HtmlSeoRanking,
  HtmlSeoRankingTier,
} from "~/features/seo/types/html-seo-analysis";
import type { ComparativeSearchConsoleData } from "~/features/seo/types/analysis";

const STOPWORDS = new Set([
  "a", "o", "e", "de", "da", "do", "em", "um", "uma", "para", "com", "que", "na", "no",
  "os", "as", "por", "se", "ao", "dos", "das", "como", "mais", "mas", "ou", "seu", "sua",
  "seus", "suas", "isso", "esta", "este", "essa", "esse", "the", "and", "or", "to", "of",
  "in", "for", "nao", "não", "ser", "sao", "são", "foi", "sua", "seu", "pelo", "pela",
]);

type AnalyzeHtmlParams = {
  html: string;
  url: string;
  mainKeyword?: string;
  gscAccessToken?: string | null;
};

/**
 * Tokeniza texto removendo stopwords.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Extrai palavras-chave relevantes com score ponderado por posição no HTML.
 */
function extractKeywords(
  parsed: ReturnType<typeof parseHtmlSignals>,
  mainKeyword?: string,
): HtmlSeoKeyword[] {
  const scores = new Map<string, { score: number; occurrences: number; inTitle: boolean; inH1: boolean; inMeta: boolean }>();

  const addTokens = (text: string, weight: number, flags: Partial<{ inTitle: boolean; inH1: boolean; inMeta: boolean }> = {}) => {
    for (const token of tokenize(text)) {
      const prev = scores.get(token) ?? {
        score: 0,
        occurrences: 0,
        inTitle: false,
        inH1: false,
        inMeta: false,
      };
      scores.set(token, {
        score: prev.score + weight,
        occurrences: prev.occurrences + 1,
        inTitle: prev.inTitle || Boolean(flags.inTitle),
        inH1: prev.inH1 || Boolean(flags.inH1),
        inMeta: prev.inMeta || Boolean(flags.inMeta),
      });
    }
  };

  if (parsed.title) addTokens(parsed.title, 5, { inTitle: true });
  if (parsed.metaDescription) addTokens(parsed.metaDescription, 3, { inMeta: true });
  for (const h of parsed.h1) addTokens(h, 4, { inH1: true });
  for (const h of parsed.h2) addTokens(h, 2);
  for (const h of parsed.h3) addTokens(h, 1.5);
  addTokens(parsed.textExcerpt, 1);

  if (mainKeyword) {
    const kw = mainKeyword.toLowerCase();
    const prev = scores.get(kw) ?? { score: 0, occurrences: 0, inTitle: false, inH1: false, inMeta: false };
    scores.set(kw, { ...prev, score: prev.score + 10, occurrences: prev.occurrences + 1 });
  }

  const wordCount = Math.max(1, parsed.estimatedWordCount);
  const maxScore = Math.max(1, ...[...scores.values()].map((v) => v.score));

  return [...scores.entries()]
    .sort((a, b) => b[1].score - a[1].score)
    .slice(0, 15)
    .map(([keyword, data]) => ({
      keyword,
      relevanceScore: Math.min(100, Math.round((data.score / maxScore) * 100)),
      occurrences: data.occurrences,
      densityPercent: Math.round((data.occurrences / wordCount) * 1000) / 10,
      inTitle: data.inTitle,
      inH1: data.inH1,
      inMetaDescription: data.inMeta,
    }));
}

/**
 * Calcula score on-page a partir dos elementos extraídos.
 */
function calculateOnPageScore(elements: HtmlSeoElements, issues: string[]): number {
  let score = 30;

  if (elements.title) score += 12;
  else issues.push("Título (<title>) ausente.");

  if (elements.metaDescription) {
    score += 10;
    if ((elements.metaDescription.length ?? 0) > 160) {
      issues.push("Meta description longa (>160 caracteres).");
      score -= 3;
    }
  } else {
    issues.push("Meta description ausente.");
  }

  if (elements.h1.length === 1) score += 10;
  else if (elements.h1.length === 0) issues.push("Nenhum H1 encontrado.");
  else issues.push("Múltiplos H1 — prefira apenas um.");

  if (elements.h2.length >= 2) score += 8;
  if (elements.wordCount >= 300) score += 8;
  else if (elements.wordCount < 150) issues.push("Conteúdo curto (<150 palavras).");

  if (elements.hasSchemaMarkup) score += 6;
  if (elements.hasFaqSection) score += 4;
  if (elements.hasLists) score += 3;
  if (elements.canonical) score += 4;
  if (elements.lang) score += 2;

  if (elements.imagesTotal > 0 && elements.imagesWithoutAlt === 0) score += 5;
  else if (elements.imagesWithoutAlt > 0) {
    issues.push(`${elements.imagesWithoutAlt} imagem(ns) sem atributo alt.`);
    score -= Math.min(8, elements.imagesWithoutAlt * 2);
  }

  if (elements.internalLinks >= 2) score += 4;

  return Math.max(0, Math.min(100, score));
}

/**
 * Calcula relevância e legibilidade do conteúdo.
 */
function calculateContentRelevance(
  parsed: ReturnType<typeof parseHtmlSignals>,
  keywords: HtmlSeoKeyword[],
  mainKeyword?: string,
): HtmlSeoContentRelevance {
  const wordCount = parsed.estimatedWordCount;
  const headingCount = parsed.h1.length + parsed.h2.length + parsed.h3.length;

  const sentences = parsed.textExcerpt.split(/[.!?]+/).filter((s) => s.trim().length > 8);
  const avgSentenceLength =
    sentences.length > 0 ? wordCount / sentences.length : wordCount;

  const readability: HtmlSeoContentRelevance["readability"] =
    avgSentenceLength <= 18 ? "Alta" : avgSentenceLength <= 26 ? "Média" : "Baixa";

  const scannability: HtmlSeoContentRelevance["scannability"] =
    headingCount >= 3 && avgSentenceLength <= 24
      ? "Alta"
      : headingCount >= 1
        ? "Média"
        : "Baixa";

  const wordCountFactor = wordCount >= 400 ? 90 : wordCount >= 200 ? 70 : wordCount >= 100 ? 50 : 25;
  const headingFactor = parsed.h1.length === 1 && parsed.h2.length >= 2 ? 90 : headingCount >= 1 ? 55 : 20;
  const metaFactor =
    parsed.title && parsed.metaDescription ? 85 : parsed.title || parsed.metaDescription ? 50 : 15;
  const mediaFactor =
    parsed.imagesTotal === 0
      ? 60
      : parsed.imagesWithoutAlt === 0
        ? 90
        : Math.max(30, 90 - parsed.imagesWithoutAlt * 15);
  const semanticFactor =
    (parsed.hasSchemaMarkup ? 40 : 0) +
    (parsed.hasFaqSection ? 30 : 0) +
    (parsed.hasLists ? 15 : 0) +
    (parsed.hasTables ? 15 : 0);

  let keywordFocus = 50;
  if (mainKeyword) {
    const match = keywords.find((k) => k.keyword === mainKeyword.toLowerCase());
    keywordFocus = match ? Math.min(100, match.relevanceScore + 20) : 30;
  } else if (keywords[0]) {
    keywordFocus = keywords[0].relevanceScore;
  }

  const score = Math.round(
    wordCountFactor * 0.25 +
      headingFactor * 0.2 +
      metaFactor * 0.15 +
      mediaFactor * 0.1 +
      Math.min(100, semanticFactor) * 0.1 +
      keywordFocus * 0.2,
  );

  return {
    score: Math.max(0, Math.min(100, score)),
    readability,
    scannability,
    factors: {
      wordCount: wordCountFactor,
      headingStructure: headingFactor,
      metaCompleteness: metaFactor,
      mediaAccessibility: mediaFactor,
      semanticMarkup: Math.min(100, semanticFactor),
    },
  };
}

/**
 * Calcula score de desempenho SERP a partir dos dados do GSC.
 */
function calculateSerpScore(gsc: ComparativeSearchConsoleData): number | null {
  if (!gsc.available || gsc.totals.impressions === 0) return null;

  const pos = gsc.totals.averagePosition;
  const positionScore = pos !== null ? Math.max(0, 100 - pos * 8) : 25;
  const ctrScore = Math.min(35, gsc.totals.ctr * 3.5);
  const volumeScore = Math.min(25, Math.log10(gsc.totals.impressions + 1) * 10);

  return Math.min(100, Math.round(positionScore * 0.45 + ctrScore + volumeScore * 0.35));
}

function tierFromScore(score: number): HtmlSeoRankingTier {
  if (score >= 80) return "excellent";
  if (score >= 65) return "good";
  if (score >= 45) return "average";
  return "needs_work";
}

const TIER_LABELS: Record<HtmlSeoRankingTier, string> = {
  excellent: "Excelente",
  good: "Bom",
  average: "Regular",
  needs_work: "Precisa melhorar",
};

/**
 * Consolida scores on-page, conteúdo e SERP em ranking final.
 */
function buildRanking(
  onPageScore: number,
  contentScore: number,
  serpScore: number | null,
): HtmlSeoRanking {
  const composite =
    serpScore !== null
      ? Math.round(onPageScore * 0.3 + contentScore * 0.3 + serpScore * 0.4)
      : Math.round(onPageScore * 0.45 + contentScore * 0.55);

  const tier = tierFromScore(composite);

  return {
    score: composite,
    tier,
    breakdown: {
      onPageScore,
      contentRelevanceScore: contentScore,
      serpPerformanceScore: serpScore,
    },
    label: TIER_LABELS[tier],
  };
}

/**
 * Analisa HTML, extrai SEO on-page, keywords e enriquece com Search Console.
 */
export async function analyzeHtmlSeo(params: AnalyzeHtmlParams): Promise<HtmlSeoAnalysisResult> {
  const { html, url, mainKeyword, gscAccessToken } = params;
  const parsed = parseHtmlSignals(html, url);
  const issues: string[] = [];

  const elements: HtmlSeoElements = {
    title: parsed.title,
    metaDescription: parsed.metaDescription,
    metaRobots: parsed.metaRobots,
    canonical: parsed.canonical,
    ogTitle: parsed.ogTitle,
    ogDescription: parsed.ogDescription,
    lang: parsed.lang,
    h1: parsed.h1,
    h2: parsed.h2,
    h3: parsed.h3,
    wordCount: parsed.estimatedWordCount,
    imagesTotal: parsed.imagesTotal,
    imagesWithoutAlt: parsed.imagesWithoutAlt,
    internalLinks: parsed.internalLinksCount,
    externalLinks: parsed.externalLinksCount,
    hasTables: parsed.hasTables,
    hasLists: parsed.hasLists,
    hasFaqSection: parsed.hasFaqSection,
    hasSchemaMarkup: parsed.hasSchemaMarkup,
  };

  const keywords = extractKeywords(parsed, mainKeyword);
  const onPageScore = calculateOnPageScore(elements, issues);
  const contentRelevance = calculateContentRelevance(parsed, keywords, mainKeyword);

  let searchConsole: ComparativeSearchConsoleData;
  if (gscAccessToken) {
    try {
      searchConsole = await buildComparativeSearchConsoleData(gscAccessToken, url, {
        mainKeyword,
        aiKeywords: keywords.slice(0, 5).map((k) => k.keyword),
      });
    } catch {
      searchConsole = {
        ...buildDisconnectedSearchConsoleData(url, mainKeyword),
        connected: true,
        insight: "Não foi possível consultar o Search Console nesta análise.",
      };
    }
  } else {
    searchConsole = buildDisconnectedSearchConsoleData(url, mainKeyword);
  }

  const serpScore = calculateSerpScore(searchConsole);
  const ranking = buildRanking(onPageScore, contentRelevance.score, serpScore);

  return {
    analyzedAt: new Date().toISOString(),
    url,
    mainKeyword,
    onPage: {
      seoScore: onPageScore,
      elements,
      issues,
      keywords,
      contentRelevance,
    },
    searchConsole,
    ranking,
  };
}
