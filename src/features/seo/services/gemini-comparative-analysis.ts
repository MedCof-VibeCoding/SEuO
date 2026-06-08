import "server-only";

import { z } from "zod";

import {
  PROMPT_ACTION_PLAN,
  PROMPT_BACKLINKS,
  PROMPT_CONTENT,
  PROMPT_KEYWORDS,
} from "~/features/seo/constants/comparative-analysis-prompts";
import { SeoAnalysisError, toSeoAnalysisError } from "~/features/seo/errors/analysis-errors";
import { mapFetchedPagesToSummary } from "~/features/seo/lib/collected-pages";
import { buildCollectionNotes, buildComparativeContext } from "~/features/seo/services/comparative-analysis-context";
import {
  actionPlanAnalysisSchema,
  backlinksAnalysisSchema,
  contentAnalysisSchema,
  keywordsAnalysisSchema,
  type ActionPlanAnalysis,
  type BacklinksAnalysis,
  type ComparativeAnalysisSteps,
  type ContentAnalysis,
  type KeywordsAnalysis,
} from "~/features/seo/services/comparative-analysis-schemas";
import type { AnalyzeArticlesInput, ComparativeArticleReport } from "~/features/seo/types/analysis";
import type { FetchedPageData } from "~/features/seo/services/page-fetcher";
import { parseAiJsonText } from "~/features/seo/services/parse-ai-json";
import { getGeminiModel, isGeminiConfigured } from "~/server/ai/gemini";

/**
 * Chama Gemini e valida JSON com schema Zod.
 */
async function callGeminiStep<T>(
  prompt: string,
  context: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  stepLabel: string,
): Promise<T> {
  const model = getGeminiModel();
  let lastInvalidJson: SeoAnalysisError | null = null;
  let lastSchemaMismatch: SeoAnalysisError | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: `${prompt}\n\nDados:\n${context}` }],
        },
      ],
      generationConfig: {
        temperature: attempt === 0 ? 0.35 : 0.2,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    });

    const text = result.response.text() ?? "";
    if (!text.trim()) {
      throw new SeoAnalysisError(
        `Gemini retornou resposta vazia (${stepLabel}).`,
        "AI_EMPTY_RESPONSE",
      );
    }

    let json: unknown;
    try {
      json = parseAiJsonText(text);
    } catch {
      console.error(`[gemini-${stepLabel}] raw response:`, text.slice(0, 800));
      lastInvalidJson = new SeoAnalysisError(
        `Resposta inválida em ${stepLabel}. Tente novamente.`,
        "AI_INVALID_JSON",
      );
      continue;
    }

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.error(`[gemini-${stepLabel}]`, parsed.error.flatten());
      console.error(`[gemini-${stepLabel}] parsed json:`, JSON.stringify(json).slice(0, 800));
      lastSchemaMismatch = new SeoAnalysisError(
        `Formato inesperado em ${stepLabel}. Tente novamente.`,
        "AI_SCHEMA_MISMATCH",
      );
      continue;
    }

    return parsed.data;
  }

  throw lastInvalidJson ?? lastSchemaMismatch ?? new SeoAnalysisError("Falha na análise.", "AI_FAILED");
}

/**
 * Executa os 4 prompts sequenciais (keywords → backlinks → conteúdo → plano).
 */
export async function runGeminiComparativeAnalysis(
  input: AnalyzeArticlesInput,
  fetchedPages: FetchedPageData[],
): Promise<ComparativeAnalysisSteps> {
  if (!isGeminiConfigured()) {
    throw new SeoAnalysisError(
      "Configure GEMINI_API_KEY no .env e reinicie o servidor (pnpm dev).",
      "GEMINI_NOT_CONFIGURED",
      503,
    );
  }

  const pageContext = buildComparativeContext(input, fetchedPages);

  try {
    const keywords = await callGeminiStep<KeywordsAnalysis>(
      PROMPT_KEYWORDS,
      pageContext,
      keywordsAnalysisSchema,
      "keywords",
    );

    const backlinks = await callGeminiStep<BacklinksAnalysis>(
      PROMPT_BACKLINKS,
      pageContext,
      backlinksAnalysisSchema,
      "backlinks",
    );

    const content = await callGeminiStep<ContentAnalysis>(
      PROMPT_CONTENT,
      pageContext,
      contentAnalysisSchema,
      "content",
    );

    const priorResults = JSON.stringify({ keywords, backlinks, content }, null, 2);
    const actionPlan = await callGeminiStep<ActionPlanAnalysis>(
      PROMPT_ACTION_PLAN,
      `${pageContext}\n\nAnálises anteriores:\n${priorResults}`,
      actionPlanAnalysisSchema,
      "action-plan",
    );

    return { keywords, backlinks, content, actionPlan };
  } catch (err) {
    console.error("[gemini-comparative]", err);
    throw toSeoAnalysisError(err, "Gemini");
  }
}

/**
 * Monta relatório editorial para o dashboard.
 */
export function mapStepsToComparativeArticle(
  steps: ComparativeAnalysisSteps,
  input: AnalyzeArticlesInput,
  fetchedPages: FetchedPageData[],
): ComparativeArticleReport {
  return {
    mode: "article",
    targetUrl: input.targetUrl,
    competitorUrls: input.competitors,
    mainKeyword: input.mainKeyword,
    collectionNotes: buildCollectionNotes(fetchedPages),
    collectedPages: mapFetchedPagesToSummary(fetchedPages),
    keywords: steps.keywords,
    backlinks: steps.backlinks,
    content: steps.content,
    actionPlan: steps.actionPlan,
  };
}

/** @deprecated */
export async function runGeminiArticleComparativeAnalysis(
  input: AnalyzeArticlesInput,
  fetchedPages: FetchedPageData[],
): Promise<ComparativeAnalysisSteps> {
  return runGeminiComparativeAnalysis(input, fetchedPages);
}

/** @deprecated */
export const mapGeminiToComparativeArticle = mapStepsToComparativeArticle;
