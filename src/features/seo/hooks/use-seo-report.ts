"use client";

import { useEffect, useState } from "react";

import { normalizeReport } from "~/features/seo/lib/normalize-report";
import type { SeoAnalysisReport } from "~/features/seo/types/analysis";

/**
 * Carrega relatório SEO por id ou shareSlug (sessionStorage + API).
 */
export function useSeoReport(slug: string | null) {
  const [report, setReport] = useState<SeoAnalysisReport | null>(null);
  const [loading, setLoading] = useState(Boolean(slug));
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError(false);
      setReport(null);
      return;
    }

    setLoading(true);
    setError(false);

    const cached = sessionStorage.getItem(`seo-report-${slug}`);
    if (cached) {
      try {
        setReport(normalizeReport(JSON.parse(cached) as SeoAnalysisReport));
        setLoading(false);
        return;
      } catch {
        /* fetch */
      }
    }

    void fetch(`/api/seo/analysis/${slug}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("not found");
        const data = (await res.json()) as { report: SeoAnalysisReport };
        setReport(normalizeReport(data.report));
        sessionStorage.setItem(`seo-report-${slug}`, JSON.stringify(data.report));
        sessionStorage.setItem(`seo-report-${data.report.id}`, JSON.stringify(data.report));
        sessionStorage.setItem(
          `seo-report-${data.report.shareSlug}`,
          JSON.stringify(data.report),
        );
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  return { report, loading, error };
}
