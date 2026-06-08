/**
 * Erro de análise comparativa com código e mensagem para o cliente.
 */
export class SeoAnalysisError extends Error {
  readonly code: string;
  readonly httpStatus: number;

  constructor(message: string, code: string, httpStatus = 502) {
    super(message);
    this.name = "SeoAnalysisError";
    this.code = code;
    this.httpStatus = httpStatus;
  }
}

type AiProviderLabel = "OpenAI" | "Gemini";

/**
 * Converte falhas da API de IA em mensagens acionáveis.
 */
export function toSeoAnalysisError(
  err: unknown,
  provider: AiProviderLabel = "Gemini",
): SeoAnalysisError {
  if (err instanceof SeoAnalysisError) return err;

  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : "Erro desconhecido";

  const lower = raw.toLowerCase();
  const prefix = provider === "OpenAI" ? "OPENAI" : "GEMINI";

  if (
    lower.includes("429") ||
    lower.includes("quota") ||
    lower.includes("too many requests") ||
    lower.includes("rate limit") ||
    lower.includes("insufficient_quota")
  ) {
    const message =
      provider === "OpenAI"
        ? "Cota da API OpenAI esgotada. Verifique billing em https://platform.openai.com/account/billing ou aguarde e tente novamente."
        : "Cota da API Gemini esgotada. Aguarde cerca de 1 minuto ou verifique billing no Google AI Studio.";
    return new SeoAnalysisError(message, `${prefix}_QUOTA_EXCEEDED`, 429);
  }

  if (
    lower.includes("401") ||
    lower.includes("403") ||
    lower.includes("api key not valid") ||
    lower.includes("invalid api key") ||
    lower.includes("incorrect api key") ||
    lower.includes("permission denied")
  ) {
    const message =
      provider === "OpenAI"
        ? "Chave OPENAI_API_KEY inválida. Crie uma em https://platform.openai.com/api-keys"
        : "Chave GEMINI_API_KEY inválida. Crie uma em https://aistudio.google.com/apikey";
    return new SeoAnalysisError(message, `${prefix}_AUTH_ERROR`, 401);
  }

  if (lower.includes("404") && lower.includes("model")) {
    const message =
      provider === "OpenAI"
        ? "Modelo OpenAI não encontrado. Ajuste OPENAI_MODEL no .env (ex.: gpt-4o-mini)."
        : "Modelo Gemini não encontrado. Ajuste GEMINI_MODEL no .env (ex.: gemini-2.5-flash).";
    return new SeoAnalysisError(message, `${prefix}_MODEL_NOT_FOUND`, 400);
  }

  if (lower.includes("fetch failed") || lower.includes("econnrefused") || lower.includes("network")) {
    return new SeoAnalysisError(
      `Falha de rede ao chamar a API ${provider}. Verifique conexão e firewall.`,
      `${prefix}_NETWORK_ERROR`,
      502,
    );
  }

  return new SeoAnalysisError(
    raw.length > 280 ? `${raw.slice(0, 280)}…` : raw,
    `${prefix}_ANALYSIS_FAILED`,
    502,
  );
}
