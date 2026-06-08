export type OptimizationMode =
  | "balanced"
  | "seo_max"
  | "conversion"
  | "authority";

export type VoiceTone = "neutral" | "professional" | "friendly" | "authoritative";

export type SearchIntent = "informational" | "commercial" | "transactional" | "navigational";

export type TextMetrics = {
  seoScore: number;
  readability: "Baixa" | "Média" | "Alta";
  ctrEstimate: number;
  keywordCoverage: number;
  scannability: "Baixa" | "Média" | "Alta";
  wordCount: number;
  charCount: number;
  headingCount: number;
  avgSentenceLength: number;
  topKeywords: { word: string; density: number }[];
};

export type OptimizationChange = {
  category: "legibilidade" | "seo" | "ctr" | "estrutura" | "conversao" | "autoridade";
  title: string;
  description: string;
};

export type DiffNote = {
  snippet: string;
  reason: string;
};

export type TextOptimizeResult = {
  optimizedText: string;
  targetKeyword?: string;
  changes: OptimizationChange[];
  diffNotes: DiffNote[];
  metricsBefore: TextMetrics;
  metricsAfter: TextMetrics;
  faqs: string[];
  mode: OptimizationMode;
  aiPowered: boolean;
};
