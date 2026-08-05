import { resolveCollectedPages } from "~/features/seo/lib/collected-pages";
import type { SeoAnalysisReport } from "~/features/seo/types/analysis";

/**
 * Preenche campos novos em relatórios antigos salvos no banco.
 */
export function normalizeReport(raw: SeoAnalysisReport): SeoAnalysisReport {
  const primary = raw.domains.find((d) => d.role === "primary");
  const defaultScores = {
    seo: primary?.overallScore ?? 0,
    content: primary?.categoryScores.content ?? 0,
    technical: primary?.categoryScores.technical ?? 0,
    conversion: primary?.categoryScores.ux ?? 0,
    authority: primary?.categoryScores.authority ?? 0,
  };

  return {
    ...raw,
    serpPosition: raw.serpPosition,
    intelligenceScores: raw.intelligenceScores ?? defaultScores,
    issueDetails: raw.issueDetails ?? [],
    highImpactChanges: raw.highImpactChanges ?? [],
    contentIntelligence:
      raw.contentIntelligence ?? {
        persuasionScore: 0,
        searchIntent: "",
        clarityScore: 0,
        authorityScore: 0,
        depthScore: 0,
        scannabilityScore: 0,
        keywordStuffingRisk: "low",
        semanticRelevance: 0,
        suggestions: {
          titles: [],
          headings: [],
          ctas: [],
          relatedKeywords: [],
          entities: [],
          faqs: [],
          contentStructure: [],
        },
      },
    contentStrategy: {
      ...(raw.contentStrategy ?? {
        missingTopics: [],
        semanticGaps: [],
        competitorKeywords: [],
        userQuestions: [],
        clusterSuggestions: [],
      }),
      clusterSuggestions: [],
    },
    comparativeArticle: raw.comparativeArticle
      ? {
          ...raw.comparativeArticle,
          collectedPages: resolveCollectedPages(raw.comparativeArticle),
        }
      : undefined,
    competitorAdvantages: raw.competitorAdvantages ?? [],
    keywordGaps: raw.keywordGaps ?? [],
    userPlan: raw.userPlan ?? "free",
  };
}
