"use client";

import { motion } from "framer-motion";
import { Clock, ExternalLink, History, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import type { ComparativeAnalysisHistoryEntry } from "~/features/seo/lib/comparative-analysis-history";
import { loadComparativeAnalysisHistory } from "~/features/seo/lib/comparative-analysis-history";

type ComparativeAnalysisHistoryPanelProps = {
  refreshKey?: number;
};

function mergeHistoryEntries(
  server: ComparativeAnalysisHistoryEntry[],
  local: ComparativeAnalysisHistoryEntry[],
): ComparativeAnalysisHistoryEntry[] {
  const seen = new Set<string>();
  const merged: ComparativeAnalysisHistoryEntry[] = [];

  for (const entry of [...server, ...local]) {
    if (seen.has(entry.id)) continue;
    seen.add(entry.id);
    merged.push(entry);
  }

  return merged.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

function urlLabel(url: string): string {
  try {
    const u = new URL(url);
    const path = u.pathname.length > 1 ? u.pathname : "";
    return `${u.hostname}${path}`.slice(0, 56);
  } catch {
    return url.slice(0, 56);
  }
}

/**
 * Lista de análises comparativas já realizadas (MongoDB + histórico local).
 */
export function ComparativeAnalysisHistoryPanel({
  refreshKey = 0,
}: ComparativeAnalysisHistoryPanelProps) {
  const [entries, setEntries] = useState<ComparativeAnalysisHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      const local = loadComparativeAnalysisHistory();

      try {
        const res = await fetch("/api/seo/analyses/recent?limit=20");
        const data = (await res.json()) as { analyses?: ComparativeAnalysisHistoryEntry[] };
        if (cancelled) return;
        setEntries(mergeHistoryEntries(data.analyses ?? [], local));
      } catch {
        if (!cancelled) setEntries(local);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  if (loading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <div className="flex items-center gap-2 text-sm text-white/50">
          <Loader2 className="h-4 w-4 animate-spin text-brand-bright" aria-hidden />
          Carregando análises anteriores…
        </div>
      </section>
    );
  }

  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-white/12 bg-black/15 px-5 py-8 text-center">
        <History className="mx-auto h-8 w-8 text-white/25" aria-hidden />
        <p className="mt-3 text-sm text-white/45">Nenhuma análise comparativa ainda.</p>
        <p className="mt-1 text-xs text-white/30">
          Após a primeira análise, ela aparecerá aqui para reabrir o relatório.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-white/85">
        <History className="h-4 w-4 text-brand-bright" aria-hidden />
        Análises anteriores
      </h2>
      <p className="mb-4 text-xs text-white/40">
        {entries.length} {entries.length === 1 ? "relatório salvo" : "relatórios salvos"}
      </p>

      <ul className="space-y-2">
        {entries.map((entry, i) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
          >
            <Link
              href={`/compare?id=${entry.id}`}
              className="group flex w-full flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 transition hover:border-brand/30 hover:bg-brand/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white group-hover:text-brand-bright">
                  {entry.mainKeyword ?? urlLabel(entry.targetUrl)}
                </p>
                <p className="truncate text-xs text-white/40">{urlLabel(entry.targetUrl)}</p>
                {entry.competitorCount > 0 ? (
                  <p className="mt-0.5 text-[10px] text-white/30">
                    {entry.competitorCount}{" "}
                    {entry.competitorCount === 1 ? "concorrente" : "concorrentes"}
                  </p>
                ) : null}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <span className="rounded-lg border border-brand/25 bg-brand/10 px-2.5 py-1 text-xs font-bold tabular-nums text-brand-bright">
                  {entry.overallScore}/100
                </span>
                <span className="flex items-center gap-1 text-[10px] text-white/35">
                  <Clock className="h-3 w-3" aria-hidden />
                  {new Date(entry.createdAt).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <ExternalLink
                  className="h-3.5 w-3.5 text-white/25 transition group-hover:text-brand-bright"
                  aria-hidden
                />
              </div>
            </Link>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
