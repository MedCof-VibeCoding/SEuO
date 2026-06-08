"use client";

import { buildWordDiff } from "~/features/text-optimize/lib/text-diff";

type DiffViewerProps = {
  original: string;
  optimized: string;
  notes?: { snippet: string; reason: string }[];
};

/**
 * Visualização diff palavra a palavra (verde/vermelho).
 */
export function DiffViewer({ original, optimized, notes }: DiffViewerProps) {
  const tokens = buildWordDiff(original, optimized);

  return (
    <div className="space-y-4">
      <div className="max-h-[320px] overflow-auto rounded-xl border border-sidebar-border bg-black/30 p-4 font-mono text-sm leading-relaxed">
        {tokens.map((t, i) => {
          if (t.type === "equal") {
            return (
              <span key={i} className="text-white/75">
                {t.text}
              </span>
            );
          }
          if (t.type === "add") {
            return (
              <span
                key={i}
                className="rounded-sm bg-emerald-500/20 text-emerald-300"
                title="Adicionado"
              >
                {t.text}
              </span>
            );
          }
          return (
            <span
              key={i}
              className="rounded-sm bg-red-500/20 text-red-300 line-through decoration-red-400/60"
              title="Removido"
            >
              {t.text}
            </span>
          );
        })}
      </div>
      {notes && notes.length > 0 ? (
        <ul className="space-y-2 text-xs text-white/55">
          {notes.map((n, i) => (
            <li
              key={i}
              className="rounded-lg border border-white/8 bg-white/[0.03] px-3 py-2"
              title={n.reason}
            >
              <span className="font-medium text-white/75">{n.snippet}</span>
              <span className="text-white/45"> — {n.reason}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
