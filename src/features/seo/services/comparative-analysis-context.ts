import type { AnalyzeArticlesInput } from "~/features/seo/types/analysis";
import type { FetchedPageData } from "~/features/seo/services/page-fetcher";

/**
 * Monta contexto JSON das páginas coletadas para os prompts comparativos.
 */
export function buildComparativeContext(
  input: AnalyzeArticlesInput,
  fetchedPages: FetchedPageData[],
): string {
  return JSON.stringify(
    {
      targetUrl: input.targetUrl,
      competitors: input.competitors,
      mainKeyword: input.mainKeyword ?? null,
      pages: fetchedPages.map((p) => ({
        url: p.url,
        role: p.role,
        fetchStatus: p.fetchStatus,
        title: p.title,
        metaDescription: p.metaDescription,
        h1: p.h1,
        h2: p.h2.slice(0, 12),
        estimatedWordCount: p.estimatedWordCount,
        hasTables: p.hasTables,
        hasFaqSection: p.hasFaqSection,
        textExcerpt: p.textExcerpt.slice(0, 2500),
      })),
    },
    null,
    2,
  );
}

/**
 * Notas sobre o que foi possível coletar via fetch.
 */
export function buildCollectionNotes(fetchedPages: FetchedPageData[]): string {
  const lines = fetchedPages.map((p) => {
    const status =
      p.fetchStatus === "success"
        ? `OK (~${p.estimatedWordCount} palavras)`
        : p.fetchStatus === "partial"
          ? `Parcial${p.error ? `: ${p.error}` : ""}`
          : `Falha${p.error ? `: ${p.error}` : ""}`;
    return `${p.role === "primary" ? "Alvo" : "Concorrente"} ${p.url} — ${status}`;
  });
  return lines.join("\n");
}
