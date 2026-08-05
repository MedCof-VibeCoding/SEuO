import type { ComparativeSearchConsoleData } from "~/features/seo/types/analysis";

export type HtmlSeoKeyword = {
  keyword: string;
  relevanceScore: number;
  occurrences: number;
  densityPercent: number;
  inTitle: boolean;
  inH1: boolean;
  inMetaDescription: boolean;
};

export type HtmlSeoElements = {
  title?: string;
  metaDescription?: string;
  metaRobots?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  lang?: string;
  h1: string[];
  h2: string[];
  h3: string[];
  wordCount: number;
  imagesTotal: number;
  imagesWithoutAlt: number;
  internalLinks: number;
  externalLinks: number;
  hasTables: boolean;
  hasLists: boolean;
  hasFaqSection: boolean;
  hasSchemaMarkup: boolean;
};

export type HtmlSeoContentRelevance = {
  score: number;
  readability: "Alta" | "Média" | "Baixa";
  scannability: "Alta" | "Média" | "Baixa";
  factors: {
    wordCount: number;
    headingStructure: number;
    metaCompleteness: number;
    mediaAccessibility: number;
    semanticMarkup: number;
  };
};

export type HtmlSeoRankingTier = "excellent" | "good" | "average" | "needs_work";

export type HtmlSeoRanking = {
  score: number;
  tier: HtmlSeoRankingTier;
  breakdown: {
    onPageScore: number;
    contentRelevanceScore: number;
    serpPerformanceScore: number | null;
  };
  label: string;
};

export type HtmlSeoAnalysisResult = {
  analyzedAt: string;
  url: string;
  mainKeyword?: string;
  onPage: {
    seoScore: number;
    elements: HtmlSeoElements;
    issues: string[];
    keywords: HtmlSeoKeyword[];
    contentRelevance: HtmlSeoContentRelevance;
  };
  searchConsole: ComparativeSearchConsoleData;
  ranking: HtmlSeoRanking;
};
