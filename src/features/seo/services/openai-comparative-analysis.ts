import "server-only";

import { z } from "zod";

import {
  PROMPT_ACTION_PLAN,
  PROMPT_CONTENT,
  PROMPT_KEYWORDS,
} from "~/features/seo/constants/comparative-analysis-prompts";
import { SeoAnalysisError, toSeoAnalysisError } from "~/features/seo/errors/analysis-errors";
import { buildComparativeContext } from "~/features/seo/services/comparative-analysis-context";
import {
  actionPlanAnalysisSchema,
  contentAnalysisSchema,
  keywordsAnalysisSchema,
  type ActionPlanAnalysis,
  type ComparativeAnalysisSteps,
  type ContentAnalysis,
  type KeywordsAnalysis,
} from "~/features/seo/services/comparative-analysis-schemas";
import type { AnalyzeArticlesInput } from "~/features/seo/types/analysis";
import type { FetchedPageData } from "~/features/seo/services/page-fetcher";
import { parseAiJsonText } from "~/features/seo/services/parse-ai-json";
import {
  getOpenAIClient,
  getOpenAIModelId,
  isOpenAIConfigured,
} from "~/server/ai/openai";

const EMPTY_BACKLINKS = {
  authority_comparison: {} as Record<string, string>,
  link_gaps: [] as string[],
  replicable_patterns: [] as string[],
  top_link_opportunities: [] as string[],
};

/**
 * Chama OpenAI e valida JSON com schema Zod.
 */
async function callOpenAIStep<T>(
  prompt: string,
  context: string,
  schema: z.ZodType<T, z.ZodTypeDef, unknown>,
  stepLabel: string,
): Promise<T> {
  const client = getOpenAIClient();
  const model = getOpenAIModelId();
  let lastInvalidJson: SeoAnalysisError | null = null;
  let lastSchemaMismatch: SeoAnalysisError | null = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    const completion = await client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Você é especialista em SEO técnico, conteúdo, UX e CRO. Use somente evidências fornecidas. Não invente métricas externas. Responda somente com JSON válido, sem markdown nem texto extra.",
        },
        {
          role: "user",
          content: `${prompt}\n\nDados:\n${context}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: attempt === 0 ? 0.35 : 0.2,
      max_tokens: 4096,
    });

    const text = completion.choices[0]?.message?.content ?? "";
    if (!text.trim()) {
      throw new SeoAnalysisError(
        `OpenAI retornou resposta vazia (${stepLabel}).`,
        "AI_EMPTY_RESPONSE",
      );
    }

    let json: unknown;
    try {
      json = parseAiJsonText(text);
    } catch {
      console.error(`[openai-${stepLabel}] raw response:`, text.slice(0, 800));
      lastInvalidJson = new SeoAnalysisError(
        `Resposta inválida em ${stepLabel}. Tente novamente.`,
        "AI_INVALID_JSON",
      );
      continue;
    }

    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      console.error(`[openai-${stepLabel}]`, parsed.error.flatten());
      console.error(`[openai-${stepLabel}] parsed json:`, JSON.stringify(json).slice(0, 800));
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
 * Executa os 3 prompts sequenciais (keywords → conteúdo → plano) via OpenAI.
 */
export async function runOpenAIComparativeAnalysis(
  input: AnalyzeArticlesInput,
  fetchedPages: FetchedPageData[],
): Promise<ComparativeAnalysisSteps> {
  if (!isOpenAIConfigured()) {
    throw new SeoAnalysisError(
      "Configure OPENAI_API_KEY no .env e reinicie o servidor (pnpm dev).",
      "OPENAI_NOT_CONFIGURED",
      503,
    );
  }

  const pageContext = buildComparativeContext(input, fetchedPages);

  try {
    const keywords = await callOpenAIStep<KeywordsAnalysis>(
      PROMPT_KEYWORDS,
      pageContext,
      keywordsAnalysisSchema,
      "keywords",
    );

    const content = await callOpenAIStep<ContentAnalysis>(
      PROMPT_CONTENT,
      pageContext,
      contentAnalysisSchema,
      "content",
    );

    const priorResults = JSON.stringify({ keywords, content }, null, 2);
    const actionPlan = await callOpenAIStep<ActionPlanAnalysis>(
      PROMPT_ACTION_PLAN,
      `${pageContext}\n\nAnálises anteriores:\n${priorResults}`,
      actionPlanAnalysisSchema,
      "action-plan",
    );

    return { keywords, backlinks: EMPTY_BACKLINKS, content, actionPlan };
  } catch (err) {
    console.error("[openai-comparative]", err);
    throw toSeoAnalysisError(err, "OpenAI");
  }
}
