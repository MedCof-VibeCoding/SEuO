import "server-only";

import { randomBytes } from "crypto";

import {
  buildComparativeInsights,
  buildCompetitorSeoNarrative,
} from "~/features/seo/lib/comparative-display";
import {
  generate30DayPlan,
  rankDomains,
} from "~/features/seo/services/comparison-engine";
import type { ComparativeAnalysisSteps } from "~/features/seo/services/comparative-analysis-schemas";
import {
  mapStepsToComparativeArticle,
  runGeminiComparativeAnalysis,
} from "~/features/seo/services/gemini-comparative-analysis";
import {
  applyPlanLimits,
  buildContentIntelligence,
  buildHighImpactChanges,
  buildIntelligenceScores,
  buildIssueDetails,
} from "~/features/seo/services/intelligence-engine";
import { fetchPageForSeoAnalysis } from "~/features/seo/services/page-fetcher";
import type {
  AnalyzeArticlesInput,
  CompetitorAdvantage,
  ContentStrategyInsight,
  DomainAnalysis,
  KeywordGap,
  SeoAnalysisReport,
  SeoCategory,
  UserPlan,
} from "~/features/seo/types/analysis";
import { SeoAnalysisError } from "~/features/seo/errors/analysis-errors";
import { isGeminiConfigured } from "~/server/ai/gemini";

function urlLabel(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 1 ? u.pathname : "";
    return `${u.hostname}${path}`.slice(0, 48);
  } catch {
    return url.slice(0, 48);
  }
}

/**
 * Domínios simplificados para gráficos do dashboard legado.
 */
function buildDomainsFromUrls(
  targetUrl: string,
  competitors: string[],
  contentScore: number,
): DomainAnalysis[] {
  const raw: Omit<DomainAnalysis, "rank">[] = [
    {
      domain: urlLabel(targetUrl),
      role: "primary",
      overallScore: contentScore,
      categoryScores: {
        technical: contentScore,
        performance: 65,
        content: contentScore,
        authority: 60,
        ux: contentScore,
      },
      metrics: [],
    },
    ...competitors.map((url) => ({
      domain: urlLabel(url),
      role: "competitor" as const,
      overallScore: Math.min(95, contentScore + 5),
      categoryScores: {
        technical: 70,
        performance: 70,
        content: 72,
        authority: 75,
        ux: 70,
      },
      metrics: [],
    })),
  ];
  return rankDomains(raw);
}

function mapKeywordGaps(gaps: string[]): KeywordGap[] {
  return gaps.slice(0, 10).map((keyword, i) => ({
    keyword,
    usedByCompetitors: true,
    opportunity: i < 3 ? "high" : "medium",
    searchIntent: "informacional",
  }));
}

/**
 * Estratégia de conteúdo em linguagem acessível, baseada no texto analisado.
 */
function buildArticleContentStrategy(
  steps: ComparativeAnalysisSteps,
  targetUrl: string,
): ContentStrategyInsight {
  const targetLabel = urlLabel(targetUrl);
  return {
    missingTopics: steps.keywords.keyword_gaps.slice(0, 6).map(
      (gap) => `No seu artigo (${targetLabel}), inclua ou reforce: “${gap}”.`,
    ),
    semanticGaps: steps.content.content_opportunities.slice(0, 5).map(
      (item) => `Melhore o texto atual: ${item}`,
    ),
    competitorKeywords: steps.keywords.top_keywords.slice(0, 5).map(
      (kw) => `Concorrentes destacam “${kw}” — avalie usar no seu conteúdo.`,
    ),
    userQuestions: steps.keywords.long_tail_opportunities.slice(0, 5).map(
      (q) => `Responda no artigo: “${q}”.`,
    ),
    clusterSuggestions: [],
  };
}

/**
 * Resumo SEO dos diferenciais dos concorrentes.
 */
function buildArticleCompetitorAdvantages(
  narrative: string,
): CompetitorAdvantage[] {
  return [
    {
      domain: "Resumo",
      pattern: "Diferenciais de SEO",
      explanation: narrative,
      opportunity: "",
    },
  ];
}

/**
 * Análise comparativa em 4 prompts Gemini (keywords, backlinks, conteúdo, plano).
 */
export async function runArticleComparativeAnalysis(
  input: AnalyzeArticlesInput,
  plan: UserPlan = "free",
): Promise<SeoAnalysisReport> {
  if (!isGeminiConfigured()) {
    throw new SeoAnalysisError(
      "Configure GEMINI_API_KEY no .env e reinicie o servidor (pnpm dev).",
      "GEMINI_NOT_CONFIGURED",
      503,
    );
  }

  const allUrls: { url: string; role: "primary" | "competitor" }[] = [
    { url: input.targetUrl, role: "primary" },
    ...input.competitors.map((url) => ({ url, role: "competitor" as const })),
  ];

  const fetchedPages = await Promise.all(
    allUrls.map(({ url, role }) => fetchPageForSeoAnalysis(url, role)),
  );

  const steps = await runGeminiComparativeAnalysis(input, fetchedPages);
  const comparativeArticle = mapStepsToComparativeArticle(steps, input, fetchedPages);

  const contentScore = Math.min(
    95,
    50 + comparativeArticle.content.content_opportunities.length * 3,
  );
  const domains = buildDomainsFromUrls(
    input.targetUrl,
    input.competitors,
    contentScore,
  );

  let primaryHost = input.targetUrl;
  try {
    primaryHost = new URL(input.targetUrl).hostname;
  } catch {
    /* keep */
  }

  const insights = buildComparativeInsights(comparativeArticle);

  const recommendations = [
    ...steps.actionPlan.short_term.map((title, i) => ({
      id: `st-${i}`,
      title,
      description: "Curto prazo",
      impact: "high" as const,
      effort: "medium" as const,
      category: "content" as SeoCategory,
    })),
    ...steps.actionPlan.medium_term.map((title, i) => ({
      id: `mt-${i}`,
      title,
      description: "Médio prazo",
      impact: "medium" as const,
      effort: "medium" as const,
      category: "content" as SeoCategory,
    })),
  ];

  const keywordGaps = mapKeywordGaps(steps.keywords.keyword_gaps);
  const aiNarrative = [
    `Keywords: ${steps.keywords.top_keywords.slice(0, 5).join(", ") || "—"}`,
    `Backlinks: ${steps.backlinks.top_link_opportunities.slice(0, 3).join("; ") || "—"}`,
    `Conteúdo: ${steps.content.content_opportunities.slice(0, 3).join("; ") || "—"}`,
  ].join("\n");

  const id = randomBytes(12).toString("hex");
  const shareSlug = randomBytes(8).toString("base64url");

  let report: SeoAnalysisReport = {
    id,
    createdAt: new Date().toISOString(),
    primaryDomain: primaryHost,
    competitors: input.competitors.map((u) => {
      try {
        return new URL(u).hostname;
      } catch {
        return u;
      }
    }),
    domains,
    winners: [],
    insights,
    recommendations: recommendations.slice(0, 15),
    plan30Days: generate30DayPlan(recommendations),
    shareSlug,
    intelligenceScores: buildIntelligenceScores(domains),
    issueDetails: buildIssueDetails(domains),
    highImpactChanges: buildHighImpactChanges(buildIssueDetails(domains)),
    contentIntelligence: buildContentIntelligence(domains),
    contentStrategy: buildArticleContentStrategy(steps, input.targetUrl),
    competitorAdvantages: buildArticleCompetitorAdvantages(
      buildCompetitorSeoNarrative(comparativeArticle),
    ),
    keywordGaps,
    comparativeArticle,
    targetUrl: input.targetUrl,
    competitorUrls: input.competitors,
    mainKeyword: input.mainKeyword,
    aiNarrative,
    aiProvider: "gemini",
    userPlan: plan,
  };

  if (!report.highImpactChanges.length) {
    report = { ...report, highImpactChanges: buildHighImpactChanges(report.issueDetails) };
  }

  return applyPlanLimits(report, plan);
}
