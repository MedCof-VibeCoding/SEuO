export type DomainRole = "primary" | "competitor";
export type UserPlan = "free" | "pro";

export type SeoCategory =
  | "technical"
  | "performance"
  | "content"
  | "authority"
  | "ux";

export type MetricStatus = "pass" | "warn" | "fail";
export type Priority = "critical" | "high" | "medium" | "low";
export type Effort = "low" | "medium" | "high";

export type IntelligenceScores = {
  seo: number;
  content: number;
  technical: number;
  conversion: number;
  authority: number;
};

export type SeoIssueDetail = {
  id: string;
  metricId: string;
  title: string;
  problem: string;
  seoImpact: string;
  conversionImpact: string;
  priority: Priority;
  effort: Effort;
  howToFix: string;
  badExample: string;
  goodExample: string;
  expectedResult: string;
  category: SeoCategory;
  estimatedTrafficGain?: "low" | "medium" | "high";
  estimatedCtrGain?: "low" | "medium" | "high";
};

export type HighImpactChange = {
  id: string;
  rank: number;
  title: string;
  summary: string;
  trafficGain: "low" | "medium" | "high";
  ctrGain: "low" | "medium" | "high";
  effort: Effort;
  rankingImpact: "low" | "medium" | "high";
};

export type ContentIntelligence = {
  persuasionScore: number;
  searchIntent: string;
  clarityScore: number;
  authorityScore: number;
  depthScore: number;
  scannabilityScore: number;
  keywordStuffingRisk: "low" | "medium" | "high";
  semanticRelevance: number;
  suggestions: {
    titles: string[];
    headings: string[];
    ctas: string[];
    relatedKeywords: string[];
    entities: string[];
    faqs: string[];
    contentStructure: string[];
  };
};

export type KeywordGap = {
  keyword: string;
  usedByCompetitors: boolean;
  opportunity: "high" | "medium" | "low";
  searchIntent: string;
};

export type ContentStrategyInsight = {
  missingTopics: string[];
  semanticGaps: string[];
  competitorKeywords: string[];
  userQuestions: string[];
  clusterSuggestions: string[];
};

export type CompetitorAdvantage = {
  domain: string;
  pattern: string;
  explanation: string;
  opportunity: string;
};

export type SeoMetric = {
  id: string;
  label: string;
  category: SeoCategory;
  value: string | number | boolean;
  displayValue: string;
  score: number;
  status: MetricStatus;
  benchmark?: string;
};

export type CategoryScores = Record<SeoCategory, number>;

export type DomainAnalysis = {
  domain: string;
  role: DomainRole;
  overallScore: number;
  categoryScores: CategoryScores;
  metrics: SeoMetric[];
  rank: number;
};

export type ComparisonWinner = {
  category: SeoCategory;
  domain: string;
  marginPercent: number;
};

export type SeoInsight = {
  id: string;
  type: "opportunity" | "warning" | "win" | "ai";
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
};

export type SeoRecommendation = {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  effort: Effort;
  category: SeoCategory;
};

export type ThirtyDayPlanItem = {
  week: number;
  focus: string;
  tasks: string[];
};

export type KeywordsStepResult = {
  top_keywords: string[];
  keyword_gaps: string[];
  quick_wins: string[];
  long_tail_opportunities: string[];
};

export type BacklinksStepResult = {
  authority_comparison: Record<string, string>;
  link_gaps: string[];
  replicable_patterns: string[];
  top_link_opportunities: string[];
};

export type ContentStepResult = {
  content_patterns: Record<string, string>;
  on_page_patterns: Record<string, string>;
  content_opportunities: string[];
};

export type ActionPlanStepResult = {
  short_term: string[];
  medium_term: string[];
  long_term: string[];
};

export type CollectedPageSummary = {
  url: string;
  role: "primary" | "competitor";
  fetchStatus: "success" | "partial" | "failed";
  title?: string;
  estimatedWordCount: number;
  h1: string[];
  h2Count: number;
  hasFaqSection: boolean;
  hasTables: boolean;
  hasLists: boolean;
  hasSchemaMarkup: boolean;
  error?: string;
};

export type ComparativeArticleReport = {
  mode: "article";
  targetUrl: string;
  competitorUrls: string[];
  mainKeyword?: string;
  niche?: string;
  objective?: string;
  collectionNotes: string;
  collectedPages?: CollectedPageSummary[];
  keywords: KeywordsStepResult;
  backlinks: BacklinksStepResult;
  content: ContentStepResult;
  actionPlan: ActionPlanStepResult;
};

export type SeoAnalysisReport = {
  id: string;
  createdAt: string;
  primaryDomain: string;
  competitors: string[];
  targetUrl?: string;
  competitorUrls?: string[];
  mainKeyword?: string;
  comparativeArticle?: ComparativeArticleReport;
  domains: DomainAnalysis[];
  winners: ComparisonWinner[];
  insights: SeoInsight[];
  recommendations: SeoRecommendation[];
  plan30Days: ThirtyDayPlanItem[];
  shareSlug: string;
  intelligenceScores: IntelligenceScores;
  issueDetails: SeoIssueDetail[];
  highImpactChanges: HighImpactChange[];
  contentIntelligence: ContentIntelligence;
  contentStrategy: ContentStrategyInsight;
  competitorAdvantages: CompetitorAdvantage[];
  keywordGaps: KeywordGap[];
  serpPosition?: SerpPositionAnalysis;
  /** Dados reais do Google Search Console para a URL alvo (últimos 28 dias). */
  searchConsole?: ComparativeSearchConsoleData;
  aiNarrative?: string;
  aiProvider?: "gemini" | "openai";
  userPlan: UserPlan;
};

export type SerpResultType =
  | "organic"
  | "featured_snippet"
  | "people_also_ask"
  | "ai_overview"
  | "not_ranking";

export type SerpKeywordRanking = {
  keyword: string;
  searchVolumeLabel: string;
  primaryPosition: number | null;
  primaryUrl: string;
  primaryResultType: SerpResultType;
  competitorPositions: { domain: string; position: number | null }[];
  trend: "up" | "down" | "stable";
  estimatedMonthlyClicks: number;
  /** Dados reais do Search Console (28 dias). */
  impressions?: number;
  clicks?: number;
  ctr?: number;
};

export type SerpFeaturePresence = {
  feature: string;
  present: boolean;
  holderDomain?: string;
};

export type SerpPositionAnalysis = {
  trackedKeywords: SerpKeywordRanking[];
  averagePosition: number | null;
  visibilityScore: number;
  keywordsInTop10: number;
  keywordsTracked: number;
  primaryDomainShare: number;
  serpFeatures: SerpFeaturePresence[];
  insight: string;
  lastChecked: string;
  mainKeyword: string;
  dataSource?: "search_console" | "estimated";
  gscProperty?: string;
  totalClicks?: number;
  totalImpressions?: number;
  averageCtr?: number;
};

import type { RankingHistoryPoint } from "~/features/seo/types/google-position-check";

export type SearchConsoleQueryMetric = {
  keyword: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
};

export type GscAudienceBreakdownItem = {
  key: string;
  label: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
};

export type GscSitemapStatus = {
  path: string;
  lastSubmitted?: string;
  lastDownloaded?: string;
  isPending: boolean;
  isSitemapsIndex: boolean;
  type?: string;
  warnings: number;
  errors: number;
};

export type GscUrlInspectionData = {
  inspectionUrl: string;
  coverageState?: string;
  indexingState?: string;
  robotsTxtState?: string;
  pageFetchState?: string;
  lastCrawlTime?: string;
  googleCanonical?: string;
  userCanonical?: string;
  crawledAs?: string;
  verdict?: string;
  referringUrls: string[];
  inspectionResultLink?: string;
  available: boolean;
  error?: string;
};

export type GscPageVisibilityItem = {
  url: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number | null;
};

export type GscIndexCoverageData = {
  targetInspection?: GscUrlInspectionData;
  pagesServingInSearch: GscPageVisibilityItem[];
  note: string;
};

export type GscLinksData = {
  inboundReferringUrls: string[];
  topInternalPages: GscPageVisibilityItem[];
  note: string;
};

export type GscSecurityIssue = {
  type: string;
  detail: string;
};

export type GscSecurityData = {
  status: "clear" | "issues_found" | "unavailable";
  issues: GscSecurityIssue[];
  note: string;
};

export type ComparativeSearchConsoleData = {
  connected: boolean;
  available: boolean;
  gscProperty?: string;
  targetUrl: string;
  mainKeyword?: string;
  mainKeywordMetrics?: SearchConsoleQueryMetric | null;
  topQueries: SearchConsoleQueryMetric[];
  totals: {
    clicks: number;
    impressions: number;
    ctr: number;
    averagePosition: number | null;
  };
  /** Evolução diária da posição da keyword principal (GSC). */
  positionHistory?: RankingHistoryPoint[];
  /** Origem geográfica do público (28d). */
  countries?: GscAudienceBreakdownItem[];
  /** Dispositivo: mobile, desktop, tablet (28d). */
  devices?: GscAudienceBreakdownItem[];
  /** Sitemaps enviados e status de leitura. */
  sitemaps?: GscSitemapStatus[];
  /** Indexação da URL alvo + páginas com impressões. */
  indexCoverage?: GscIndexCoverageData;
  /** Inspeção individual da URL alvo. */
  urlInspection?: GscUrlInspectionData;
  /** Links de referência e páginas internas com mais visibilidade. */
  links?: GscLinksData;
  /** Sinais de segurança derivados da inspeção / indisponibilidade da API. */
  security?: GscSecurityData;
  insight: string;
  checkedAt: string;
};

export type AnalyzeArticlesInput = {
  targetUrl: string;
  competitors: string[];
  mainKeyword?: string;
  niche?: string;
  objective?: string;
  audience?: string;
};

/** @deprecated */
export type AnalyzeDomainsInput = AnalyzeArticlesInput;
