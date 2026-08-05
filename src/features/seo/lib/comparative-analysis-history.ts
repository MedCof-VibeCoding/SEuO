import type { SeoAnalysisReport } from "~/features/seo/types/analysis";

export const COMPARATIVE_HISTORY_KEY = "seuo-comparative-analysis-history";
const MAX_ENTRIES = 20;

export type ComparativeAnalysisHistoryEntry = {
  id: string;
  shareSlug: string;
  primaryDomain: string;
  targetUrl: string;
  mainKeyword?: string;
  competitorCount: number;
  overallScore: number;
  createdAt: string;
};

/**
 * Carrega histórico local de análises comparativas.
 */
export function loadComparativeAnalysisHistory(): ComparativeAnalysisHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(COMPARATIVE_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ComparativeAnalysisHistoryEntry[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Persiste análise no histórico local (mais recente primeiro).
 */
export function saveComparativeAnalysisHistory(
  report: SeoAnalysisReport,
): ComparativeAnalysisHistoryEntry[] {
  const primary = report.domains.find((d) => d.role === "primary");
  const entry: ComparativeAnalysisHistoryEntry = {
    id: report.id,
    shareSlug: report.shareSlug,
    primaryDomain: report.primaryDomain,
    targetUrl: report.targetUrl ?? report.comparativeArticle?.targetUrl ?? report.primaryDomain,
    mainKeyword: report.mainKeyword ?? report.comparativeArticle?.mainKeyword,
    competitorCount: report.competitorUrls?.length ?? report.competitors.length,
    overallScore: primary?.overallScore ?? 0,
    createdAt: report.createdAt,
  };

  const prev = loadComparativeAnalysisHistory().filter((e) => e.id !== entry.id);
  const next = [entry, ...prev].slice(0, MAX_ENTRIES);
  localStorage.setItem(COMPARATIVE_HISTORY_KEY, JSON.stringify(next));
  return next;
}
