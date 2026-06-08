"use client";

import { motion } from "framer-motion";
import { Clock, History } from "lucide-react";

import { RankBadge } from "~/app/google-position-checker/_components/rank-badge";
import type { GooglePositionHistoryEntry } from "~/features/seo/types/google-position-check";

type HistoryPanelProps = {
  entries: GooglePositionHistoryEntry[];
  onSelect: (entry: GooglePositionHistoryEntry) => void;
};

/**
 * Lista das últimas consultas de posição (localStorage).
 */
export function HistoryPanel({ entries, onSelect }: HistoryPanelProps) {
  if (entries.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-white/12 bg-black/15 px-5 py-8 text-center">
        <History className="mx-auto h-8 w-8 text-white/25" aria-hidden />
        <p className="mt-3 text-sm text-white/45">Nenhuma consulta recente neste navegador.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/85">
        <History className="h-4 w-4 text-brand-bright" aria-hidden />
        Histórico de consultas
      </h2>
      <ul className="space-y-2">
        {entries.map((entry, i) => (
          <motion.li
            key={entry.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <button
              type="button"
              onClick={() => onSelect(entry)}
              className="flex w-full flex-col gap-2 rounded-xl border border-white/8 bg-white/[0.03] px-4 py-3 text-left transition hover:border-brand/30 hover:bg-brand/5 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{entry.keyword}</p>
                <p className="truncate text-xs text-white/40">{entry.url}</p>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <RankBadge tier={entry.rankTier} className="scale-90" />
                <span className="text-sm font-bold tabular-nums text-white">
                  {entry.position !== null ? `#${entry.position}` : "—"}
                </span>
                <span className="flex items-center gap-1 text-[10px] text-white/35">
                  <Clock className="h-3 w-3" />
                  {new Date(entry.checkedAt).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </button>
          </motion.li>
        ))}
      </ul>
    </section>
  );
}
