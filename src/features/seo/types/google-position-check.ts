/** Faixa de ranking para badges de UX. */
export type GoogleRankTier = "top_3" | "top_10" | "top_50" | "not_ranking";

/** Ponto da série temporal de posição (menor = melhor). */
export type RankingHistoryPoint = {
  date: string;
  position: number | null;
};

/** Palavra-chave associada à mesma URL com posição estimada na SERP. */
export type RelatedRankingKeyword = {
  keyword: string;
  position: number | null;
  rankTier: GoogleRankTier;
  searchVolumeLabel: string;
  /** Quão ligada ao conteúdo da página (0–100, estimado). */
  relevanceScore: number;
  isPrimary: boolean;
};

/**
 * Resultado de uma consulta URL + palavra-chave no Google.
 */
export type GooglePositionCheckResult = {
  dataSource: "search_console" | "mock";
  /** Propriedade GSC usada (ex.: sc-domain:site.com). */
  gscProperty?: string;
  url: string;
  keyword: string;
  position: number | null;
  rankTier: GoogleRankTier;
  found: boolean;
  pageTitle: string;
  metaDescription: string;
  foundUrl: string;
  checkedAt: string;
  searchVolume: number;
  searchVolumeLabel: string;
  competition: "low" | "medium" | "high";
  competitionLabel: string;
  estimatedCtr: number;
  seoScore: number;
  rankingHistory: RankingHistoryPoint[];
  /** Outras keywords para as quais esta URL ranqueia (semântica do texto). */
  relatedKeywords: RelatedRankingKeyword[];
  suggestion: string;
};

export type GooglePositionHistoryEntry = {
  id: string;
  url: string;
  keyword: string;
  position: number | null;
  rankTier: GoogleRankTier;
  checkedAt: string;
};
