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
import {
  mapStepsToComparativeArticle,
} from "~/features/seo/services/gemini-comparative-analysis";
import { runOpenAIComparativeAnalysis } from "~/features/seo/services/openai-comparative-analysis";
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
import type { ComparativeAnalysisSteps } from "~/features/seo/services/comparative-analysis-schemas";
import { isOpenAIConfigured } from "~/server/ai/openai";

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
function buildDomainsFromPages(
  pages: Awaited<ReturnType<typeof fetchPageForSeoAnalysis>>[],
): DomainAnalysis[] {
  const raw: Omit<DomainAnalysis, "rank">[] = pages.map((page) => {
    const technical = Math.min(
      100,
      (page.title ? 20 : 0) +
        (page.metaDescription ? 20 : 0) +
        (page.h1.length === 1 ? 20 : page.h1.length > 0 ? 10 : 0) +
        (page.canonical ? 15 : 0) +
        (page.hasSchemaMarkup ? 15 : 0) +
        (page.lang ? 10 : 0),
    );
    const content = Math.min(
      100,
      Math.round(
        Math.min(50, page.estimatedWordCount / 20) +
          Math.min(20, page.h2.length * 3) +
          Math.min(10, page.h3.length * 2) +
          (page.hasFaqSection ? 10 : 0) +
          (page.hasTables || page.hasLists ? 10 : 0),
      ),
    );
    const accessibleImages =
      page.imagesTotal === 0
        ? 10
        : Math.round(10 * (1 - page.imagesWithoutAlt / page.imagesTotal));
    const ux = Math.min(
      100,
      30 +
        Math.min(25, page.h2.length * 4) +
        (page.hasLists ? 15 : 0) +
        (page.hasTables ? 10 : 0) +
        accessibleImages +
        (page.lang ? 10 : 0),
    );
    const overallScore = Math.round((technical + content + ux) / 3);

    return {
      domain: urlLabel(page.url),
      role: page.role,
      overallScore,
      categoryScores: {
        technical,
        performance: 0,
        content,
        authority: 0,
        ux,
      },
      metrics: [],
    };
  });
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
 * Análise comparativa em 3 prompts OpenAI (keywords, conteúdo, plano).
 */
export async function runArticleComparativeAnalysis(
  input: AnalyzeArticlesInput,
  plan: UserPlan = "free",
): Promise<SeoAnalysisReport> {
  if (!isOpenAIConfigured()) {
    throw new SeoAnalysisError(
      "Configure OPENAI_API_KEY no .env e reinicie o servidor (pnpm dev).",
      "OPENAI_NOT_CONFIGURED",
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

  const steps: ComparativeAnalysisSteps = await runOpenAIComparativeAnalysis(input, fetchedPages);
  const comparativeArticle = mapStepsToComparativeArticle(steps, input, fetchedPages);

  const domains = buildDomainsFromPages(fetchedPages);

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
    aiProvider: "openai",
    userPlan: plan,
  };

  if (!report.highImpactChanges.length) {
    report = { ...report, highImpactChanges: buildHighImpactChanges(report.issueDetails) };
  }

  return applyPlanLimits(report, plan);
}
