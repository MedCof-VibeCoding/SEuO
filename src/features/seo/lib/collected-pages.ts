import type { CollectedPageSummary, ComparativeArticleReport } from "~/features/seo/types/analysis";
import type { FetchedPageData } from "~/features/seo/services/page-fetcher";

/**
 * Converte páginas buscadas em resumo para o dashboard.
 */
export function mapFetchedPagesToSummary(
  fetchedPages: FetchedPageData[],
): CollectedPageSummary[] {
  return fetchedPages.map((page) => ({
    url: page.url,
    role: page.role,
    fetchStatus: page.fetchStatus,
    title: page.title,
    estimatedWordCount: page.estimatedWordCount,
    h1: page.h1,
    h2Count: page.h2.length,
    hasFaqSection: page.hasFaqSection,
    hasTables: page.hasTables,
    hasLists: page.hasLists,
    hasSchemaMarkup: page.hasSchemaMarkup,
    error: page.error,
  }));
}

/**
 * Fallback para relatórios antigos sem collectedPages.
 */
export function resolveCollectedPages(
  article: ComparativeArticleReport,
): CollectedPageSummary[] {
  if (article.collectedPages?.length) {
    return article.collectedPages;
  }

  const urls = [
    { url: article.targetUrl, role: "primary" as const },
    ...article.competitorUrls.map((url) => ({ url, role: "competitor" as const })),
  ];

  return urls.map(({ url, role }) => {
    const line = article.collectionNotes
      .split("\n")
      .find((l) => l.includes(url));

    const fetchStatus: CollectedPageSummary["fetchStatus"] = line?.includes("OK")
      ? "success"
      : line?.includes("Parcial")
        ? "partial"
        : line?.includes("Falha")
          ? "failed"
          : "partial";

    const wordsMatch = line?.match(/~(\d+) palavras/);
    const estimatedWordCount = wordsMatch ? Number(wordsMatch[1]) : 0;

    return {
      url,
      role,
      fetchStatus,
      estimatedWordCount,
      h1: [],
      h2Count: 0,
      hasFaqSection: false,
      hasTables: false,
      hasLists: false,
      hasSchemaMarkup: false,
      error: line?.includes(":") ? line.split("—")[1]?.trim() : undefined,
    };
  });
}
