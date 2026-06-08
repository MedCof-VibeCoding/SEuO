import "server-only";

import { GoogleGenerativeAI } from "@google/generative-ai";

import { env } from "~/env";

const DEFAULT_MODEL = "gemini-2.5-flash";

function getGeminiApiKey(): string | undefined {
  const key = process.env.GEMINI_API_KEY ?? env.GEMINI_API_KEY;
  const trimmed = key?.trim();
  return trimmed || undefined;
}

function getGeminiModelId(): string {
  const model = process.env.GEMINI_MODEL ?? env.GEMINI_MODEL;
  return model?.trim() || DEFAULT_MODEL;
}

/**
 * Indica se a API Gemini está configurada.
 */
export function isGeminiConfigured(): boolean {
  return Boolean(getGeminiApiKey());
}

/**
 * Retorna cliente e modelo Gemini para uso server-side.
 */
export function getGeminiModel() {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const modelId = getGeminiModelId();
  return genAI.getGenerativeModel({ model: modelId });
}
