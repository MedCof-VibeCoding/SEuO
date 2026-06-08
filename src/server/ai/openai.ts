import "server-only";

import OpenAI from "openai";

import { env } from "~/env";

function getOpenAIApiKey(): string | undefined {
  const key = process.env.OPENAI_API_KEY ?? env.OPENAI_API_KEY;
  const trimmed = key?.trim();
  return trimmed || undefined;
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
