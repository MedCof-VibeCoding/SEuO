import type { AnalyzeArticlesInput, SeoAnalysisReport, UserPlan } from "~/features/seo/types/analysis";
import { runArticleComparativeAnalysis } from "~/features/seo/services/run-article-analysis";

/**
 * Executa análise comparativa editorial (artigo vs SERP) — padrão MedCof.
 */
export async function runSeoAnalysis(
  input: AnalyzeArticlesInput,
  plan: UserPlan = "free",
): Promise<SeoAnalysisReport> {
  return runArticleComparativeAnalysis(input, plan);
}
