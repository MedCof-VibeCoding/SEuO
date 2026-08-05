import "server-only";

import { parseHtmlSignals } from "~/features/seo/lib/html-parser";

export type PageFetchRole = "primary" | "competitor";

export type FetchedPageData = {
  url: string;
  role: PageFetchRole;
  fetchStatus: "success" | "partial" | "failed";
  statusCode?: number;
  error?: string;
  title?: string;
  metaDescription?: string;
  metaRobots?: string;
  canonical?: string;
  lang?: string;
  h1: string[];
  h2: string[];
  h3: string[];
  estimatedWordCount: number;
  hasTables: boolean;
  hasLists: boolean;
  hasFaqSection: boolean;
  internalLinksCount: number;
  externalLinksCount: number;
  imagesTotal: number;
  imagesWithoutAlt: number;
  hasSchemaMarkup: boolean;
  textExcerpt: string;
};

const FETCH_TIMEOUT_MS = 18_000;
const MAX_BODY_BYTES = 800_000;

/**
 * Busca URL e extrai sinais on-page para análise comparativa.
 */
export async function fetchPageForSeoAnalysis(
  url: string,
  role: PageFetchRole,
): Promise<FetchedPageData> {
  const base: FetchedPageData = {
    url,
    role,
    fetchStatus: "failed",
    h1: [],
    h2: [],
    h3: [],
    estimatedWordCount: 0,
    hasTables: false,
    hasLists: false,
    hasFaqSection: false,
    internalLinksCount: 0,
    externalLinksCount: 0,
    imagesTotal: 0,
    imagesWithoutAlt: 0,
    hasSchemaMarkup: false,
    textExcerpt: "",
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEuO-SEO-Bot/1.0; +https://grupomedcof.com.br)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return {
        ...base,
        fetchStatus: "partial",
        statusCode: res.status,
        error: `HTTP ${res.status}`,
      };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return {
        ...base,
        fetchStatus: "partial",
        statusCode: res.status,
        error: "Resposta não é HTML",
      };
    }

    const buffer = await res.arrayBuffer();
    const slice = buffer.byteLength > MAX_BODY_BYTES ? buffer.slice(0, MAX_BODY_BYTES) : buffer;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);

    const parsed = parseHtmlSignals(html, url);
    const fetchStatus =
      parsed.estimatedWordCount < 80 && !parsed.title ? "partial" : "success";

    return {
      ...base,
      title: parsed.title,
      metaDescription: parsed.metaDescription,
      metaRobots: parsed.metaRobots,
      canonical: parsed.canonical,
      lang: parsed.lang,
      h1: parsed.h1,
      h2: parsed.h2,
      h3: parsed.h3,
      estimatedWordCount: parsed.estimatedWordCount,
      hasTables: parsed.hasTables,
      hasLists: parsed.hasLists,
      hasFaqSection: parsed.hasFaqSection,
      internalLinksCount: parsed.internalLinksCount,
      externalLinksCount: parsed.externalLinksCount,
      imagesTotal: parsed.imagesTotal,
      imagesWithoutAlt: parsed.imagesWithoutAlt,
      hasSchemaMarkup: parsed.hasSchemaMarkup,
      textExcerpt: parsed.textExcerpt,
      fetchStatus,
      statusCode: res.status,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro de rede";
    return { ...base, error: message };
  }
}
