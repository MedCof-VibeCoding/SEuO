import "server-only";

import OpenAI from "openai";

import { env } from "~/env";

const DEFAULT_MODEL = "gpt-4o-mini";

function getOpenAIApiKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY ?? env.OPENAI_API_KEY;
  const trimmed = key?.trim();
  return trimmed || undefined;
}

/**
 * ID do modelo OpenAI (env OPENAI_MODEL ou padrão gpt-4o-mini).
 */
export function getOpenAIModelId(): string {
  const model = process.env.OPENAI_MODEL ?? env.OPENAI_MODEL;
  return model?.trim() || DEFAULT_MODEL;
}

/**
 * Indica se a chave da API OpenAI está configurada.
 */
export function isOpenAIConfigured(): boolean {
  return Boolean(getOpenAIApiKey());
}

/**
 * Cliente OpenAI oficial (use apenas em código server-side / tRPC).
 */
export function getOpenAIClient(): OpenAI {
  const apiKey = getOpenAIApiKey();
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }
  return new OpenAI({ apiKey });
}
