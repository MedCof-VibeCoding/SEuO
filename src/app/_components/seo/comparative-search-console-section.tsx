"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ComparativeSearchConsolePanel } from "~/app/_components/seo/comparative-search-console-panel";
import type { ComparativeSearchConsoleData } from "~/features/seo/types/analysis";

function disconnectedFallback(
  targetUrl: string,
  mainKeyword?: string,
): ComparativeSearchConsoleData {
  return {
    connected: false,
    available: false,
    targetUrl,
    mainKeyword,
    topQueries: [],
    totals: { clicks: 0, impressions: 0, ctr: 0, averagePosition: null },
    insight:
      "Entre com Google para incluir posição, cliques e impressões reais do Search Console no relatório.",
    checkedAt: new Date().toISOString(),
  };
}

type ComparativeSearchConsoleSectionProps = {
  initialData?: ComparativeSearchConsoleData;
  targetUrl?: string;
  mainKeyword?: string;
};

/**
 * Carrega e exibe métricas GSC no relatório comparativo (salvas ou via API).
 */
export function ComparativeSearchConsoleSection({
  initialData,
  targetUrl,
  mainKeyword,
}: ComparativeSearchConsoleSectionProps) {
  const [data, setData] = useState<ComparativeSearchConsoleData | null>(initialData ?? null);
  const [loading, setLoading] = useState(!initialData && Boolean(targetUrl));

  useEffect(() => {
    if (initialData) {
      setData(initialData);
      setLoading(false);
      return;
    }

    if (!targetUrl) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ url: targetUrl! });
        if (mainKeyword?.trim()) params.set("keyword", mainKeyword.trim());
        const res = await fetch(`/api/seo/search-console/page-metrics?${params.toString()}`);
        const json = (await res.json()) as { searchConsole?: ComparativeSearchConsoleData };
        if (!cancelled) setData(json.searchConsole ?? null);
      } catch {
        if (!cancelled) {
          setData(disconnectedFallback(targetUrl!, mainKeyword));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [initialData, targetUrl, mainKeyword]);

  if (!targetUrl && !data) return null;

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-white/50">
        <Loader2 className="h-4 w-4 animate-spin text-brand-bright" aria-hidden />
        Consultando Google Search Console…
      </div>
    );
  }

  if (!data) return null;

  return <ComparativeSearchConsolePanel data={data} />;
}
