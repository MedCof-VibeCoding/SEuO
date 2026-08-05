import "server-only";

import { z } from "zod";

import { env } from "~/env";

const CLARITY_EXPORT_URL =
  "https://www.clarity.ms/export-data/api/v1/project-live-insights";

export const clarityDimensions = [
  "Browser",
  "Device",
  "Country/Region",
  "OS",
  "Source",
  "Medium",
  "Campaign",
  "Channel",
  "URL",
] as const;

export type ClarityDimension = (typeof clarityDimensions)[number];

const clarityMetricSchema = z.object({
  metricName: z.string(),
  information: z.array(z.record(z.unknown())),
});

const clarityResponseSchema = z.array(clarityMetricSchema);

export type ClarityMetric = z.infer<typeof clarityMetricSchema>;

export type ClarityInsightsOptions = {
  numOfDays?: 1 | 2 | 3;
  dimensions?: ClarityDimension[];
};

/**
 * Erro normalizado retornado pela API do Clarity.
 */
export class ClarityApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "ClarityApiError";
  }
}

/**
 * Indica se o token de exportação está configurado no servidor.
 */
export function isClarityConfigured(): boolean {
  return Boolean(env.CLARITY_API_TOKEN);
}

/**
 * Traduz o status HTTP do Clarity em um código interno.
 */
function errorCode(status: number): string {
  if (status === 401 || status === 403) return "CLARITY_UNAUTHORIZED";
  if (status === 429) return "CLARITY_RATE_LIMITED";
  return "CLARITY_API_ERROR";
}

/**
 * Explica o erro do Clarity em linguagem acionável.
 */
function errorMessage(status: number): string {
  if (status === 401 || status === 403) {
    return "O token do Clarity foi recusado. Gere um novo token de exportação nas configurações do projeto.";
  }
  if (status === 429) {
    return "O limite diário do Clarity foi atingido (10 consultas por projeto por dia). Os dados voltam a ficar disponíveis quando a cota renovar.";
  }
  return `O Microsoft Clarity respondeu com HTTP ${status}. Tente novamente em alguns minutos.`;
}

/**
 * Consulta insights agregados dos últimos 1–3 dias no Microsoft Clarity.
 */
export async function fetchClarityInsights(
  options: ClarityInsightsOptions = {},
): Promise<ClarityMetric[]> {
  const token = env.CLARITY_API_TOKEN;
  if (!token) {
    throw new ClarityApiError(
      "CLARITY_API_TOKEN não configurado.",
      503,
      "CLARITY_NOT_CONFIGURED",
    );
  }

  const numOfDays = options.numOfDays ?? 1;
  const dimensions = options.dimensions ?? ["URL"];
  if (dimensions.length > 3) {
    throw new ClarityApiError(
      "O Clarity aceita no máximo três dimensões.",
      400,
      "INVALID_DIMENSIONS",
    );
  }

  const url = new URL(CLARITY_EXPORT_URL);
  url.searchParams.set("numOfDays", String(numOfDays));
  dimensions.forEach((dimension, index) => {
    url.searchParams.set(`dimension${index + 1}`, dimension);
  });

  const response = await fetch(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
    signal: AbortSignal.timeout(30_000),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new ClarityApiError(
      errorMessage(response.status),
      response.status,
      errorCode(response.status),
    );
  }

  const json: unknown = await response.json();
  const parsed = clarityResponseSchema.safeParse(json);
  if (!parsed.success) {
    throw new ClarityApiError(
      "Resposta inesperada do Microsoft Clarity.",
      502,
      "CLARITY_INVALID_RESPONSE",
    );
  }

  return parsed.data;
}
