import "server-only";

import { env } from "~/env";

const SEMRUSH_V3_BASE_URL = "https://api.semrush.com/";
const SEMRUSH_V4_BASE_URL = "https://api.semrush.com/apis/v4/";

/**
 * Erro normalizado retornado pela API do Semrush.
 */
export class SemrushApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string,
  ) {
    super(message);
    this.name = "SemrushApiError";
  }
}

/**
 * Lê a chave Semrush do ambiente (server-only).
 */
function getSemrushApiKey(): string | undefined {
  const key = process.env.SEMRUSH_API_KEY ?? env.SEMRUSH_API_KEY;
  const trimmed = key?.trim();
  return trimmed || undefined;
}

/**
 * Indica se a chave Semrush está configurada no servidor.
 */
export function isSemrushConfigured(): boolean {
  return Boolean(getSemrushApiKey());
}

/**
 * Retorna a chave Semrush ou lança se não estiver configurada.
 */
export function requireSemrushApiKey(): string {
  const apiKey = getSemrushApiKey();
  if (!apiKey) {
    throw new SemrushApiError(
      "SEMRUSH_API_KEY não configurada. Adicione no .env e reinicie o servidor.",
      503,
      "SEMRUSH_NOT_CONFIGURED",
    );
  }
  return apiKey;
}

type SemrushV3Params = Record<string, string | number | boolean | undefined>;

/**
 * Chama a Analytics API v3 do Semrush (query `key=`).
 * Docs: https://developer.semrush.com/api/
 */
export async function fetchSemrushV3(
  type: string,
  params: SemrushV3Params = {},
): Promise<string> {
  const apiKey = requireSemrushApiKey();
  const search = new URLSearchParams();
  search.set("type", type);
  search.set("key", apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    search.set(key, String(value));
  }

  const url = `${SEMRUSH_V3_BASE_URL}?${search.toString()}`;
  const res = await fetch(url, { method: "GET", cache: "no-store" });
  const body = await res.text();

  if (!res.ok) {
    throw new SemrushApiError(
      "Falha ao consultar a API Semrush (v3).",
      res.status,
      "SEMRUSH_API_ERROR",
    );
  }

  if (body.startsWith("ERROR")) {
    throw new SemrushApiError(body.trim(), 502, "SEMRUSH_API_ERROR");
  }

  return body;
}

type SemrushV4Options = {
  path: string;
  query?: SemrushV3Params;
};

/**
 * Chama a API v4 do Semrush com header `Authorization: Apikey …`.
 * Docs: https://developer.semrush.com/api/v4/get-started/quick-start/
 */
export async function fetchSemrushV4(
  options: SemrushV4Options,
): Promise<unknown> {
  const apiKey = requireSemrushApiKey();
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(options.query ?? {})) {
    if (value === undefined) continue;
    search.set(key, String(value));
  }

  const path = options.path.replace(/^\//, "");
  const qs = search.toString();
  const url = `${SEMRUSH_V4_BASE_URL}${path}${qs ? `?${qs}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
    headers: {
      Authorization: `Apikey ${apiKey}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new SemrushApiError(
      detail || "Falha ao consultar a API Semrush (v4).",
      res.status,
      "SEMRUSH_API_ERROR",
    );
  }

  return res.json() as Promise<unknown>;
}
