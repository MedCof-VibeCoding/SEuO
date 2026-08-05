"use client";

import { useMemo, useState } from "react";

import type { SeoInsight } from "~/features/seo/types/analysis";

import { CopyButton } from "./copy-button";

const TYPE_LABELS: Record<SeoInsight["type"], string> = {
  win: "Quick win",
  opportunity: "Conteúdo",
  warning: "Alerta",
  ai: "IA",
};

const TYPE_STYLES: Record<SeoInsight["type"], string> = {
  win: "bg-emerald-400/15 text-emerald-200",
  opportunity: "bg-brand/20 text-brand-bright",
  warning: "bg-amber-400/15 text-amber-200",
  ai: "bg-sky-400/15 text-sky-200",
};

type InsightsBoardProps = {
  insights: SeoInsight[];
};

/**
 * Lista de insights com filtro por tipo e cópia rápida.
 */
export function InsightsBoard({ insights }: InsightsBoardProps) {
  const [filter, setFilter] = useState<SeoInsight["type"] | "all">("all");

  const types = useMemo(() => {
    const counts = new Map<SeoInsight["type"], number>();
    for (const insight of insights) {
      counts.set(insight.type, (counts.get(insight.type) ?? 0) + 1);
    }
    return [...counts.entries()];
  }, [insights]);

  const visible = filter === "all" ? insights : insights.filter((i) => i.type === filter);

  if (!insights.length) {
    return (
      <p className="text-sm text-white/45">Nenhum insight identificado nesta análise.</p>
    );
  }

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <FilterChip
          active={filter === "all"}
          onClick={() => setFilter("all")}
          label={`Todos (${insights.length})`}
        />
        {types.map(([type, count]) => (
          <FilterChip
            key={type}
            active={filter === type}
            onClick={() => setFilter(type)}
            label={`${TYPE_LABELS[type]} (${count})`}
          />
        ))}
        <span className="ml-auto">
          <CopyButton
            text={visible.map((i) => `• ${i.title}\n  ${i.description}`).join("\n\n")}
            label="Copiar lista"
          />
        </span>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {visible.map((insight) => (
          <li
            key={insight.id}
            className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-brand/25 hover:bg-white/[0.04]"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium leading-snug text-white/90">{insight.title}</p>
              <span
                className={[
                  "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                  TYPE_STYLES[insight.type],
                ].join(" ")}
              >
                {TYPE_LABELS[insight.type]}
              </span>
            </div>
            <p className="mt-1.5 text-sm leading-relaxed text-white/55">
              {insight.description}
            </p>
            <div className="mt-3 opacity-0 transition group-hover:opacity-100 focus-within:opacity-100">
              <CopyButton text={`${insight.title}\n${insight.description}`} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Botão de filtro por tipo de insight.
 */
function FilterChip({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "rounded-full border px-3 py-1.5 text-xs font-medium transition",
        active
          ? "border-brand/45 bg-brand/20 text-white"
          : "border-white/10 text-white/45 hover:bg-white/5 hover:text-white/75",
      ].join(" ")}
    >
      {label}
    </button>
  );
}
