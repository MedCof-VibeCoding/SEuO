"use client";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  HelpCircle,
  List,
  Table2,
  XCircle,
} from "lucide-react";

import type { CollectedPageSummary } from "~/features/seo/types/analysis";

type DataCollectionPanelProps = {
  pages: CollectedPageSummary[];
  mainKeyword?: string;
};

const STATUS_CONFIG = {
  success: {
    label: "Coletado",
    icon: CheckCircle2,
    className: "border-brand/30 bg-brand/10 text-brand-bright",
  },
  partial: {
    label: "Parcial",
    icon: AlertTriangle,
    className: "border-amber-500/30 bg-amber-500/10 text-amber-200",
  },
  failed: {
    label: "Falha",
    icon: XCircle,
    className: "border-white/15 bg-white/5 text-white/50",
  },
} as const;

/**
 * Resumo visual das páginas coletadas na análise comparativa.
 */
export function DataCollectionPanel({ pages, mainKeyword }: DataCollectionPanelProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-widest text-seo-accent-bright">
          Coleta de dados
        </p>
        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/50">
          {pages.length === 1 ? "1 página analisada" : `${pages.length} páginas analisadas`}
        </span>
      </div>

      {mainKeyword ? (
        <p className="text-sm text-white/50">
          Palavra-chave:{" "}
          <span className="font-medium text-white/80">{mainKeyword}</span>
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {pages.map((page) => (
          <PageCard key={page.url} page={page} />
        ))}
      </div>
    </div>
  );
}

function PageCard({ page }: { page: CollectedPageSummary }) {
  const status = STATUS_CONFIG[page.fetchStatus];
  const StatusIcon = status.icon;
  const roleLabel = page.role === "primary" ? "Artigo-alvo" : "Concorrente";

  return (
    <article className="flex flex-col rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-start justify-between gap-2">
        <span
          className={[
            "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
            page.role === "primary"
              ? "border-brand/35 bg-brand/15 text-brand-bright"
              : "border-white/15 bg-white/5 text-white/55",
          ].join(" ")}
        >
          {roleLabel}
        </span>
        <span
          className={[
            "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
            status.className,
          ].join(" ")}
        >
          <StatusIcon className="h-3 w-3" aria-hidden />
          {status.label}
        </span>
      </div>

      <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-white/90">
        {page.title?.trim() || "Sem título detectado"}
      </h3>
      <a
        href={page.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1 truncate text-xs text-brand-bright/80 hover:underline"
      >
        {page.url}
      </a>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <StatChip icon={FileText} label="Palavras" value={String(page.estimatedWordCount)} />
        <StatChip icon={FileText} label="H1" value={String(page.h1.length)} />
        <StatChip icon={FileText} label="H2" value={String(page.h2Count)} />
        <StatChip
          icon={HelpCircle}
          label="FAQ"
          value={page.hasFaqSection ? "Sim" : "Não"}
          active={page.hasFaqSection}
        />
        <StatChip
          icon={Table2}
          label="Tabelas"
          value={page.hasTables ? "Sim" : "Não"}
          active={page.hasTables}
        />
        <StatChip
          icon={List}
          label="Listas"
          value={page.hasLists ? "Sim" : "Não"}
          active={page.hasLists}
        />
      </div>

      {page.h1[0] ? (
        <p className="mt-3 text-xs text-white/45">
          <span className="font-semibold text-white/55">H1:</span> {page.h1[0]}
        </p>
      ) : null}

      {page.error ? (
        <p className="mt-2 text-xs text-amber-200/80">{page.error}</p>
      ) : null}
    </article>
  );
}

function StatChip({
  icon: Icon,
  label,
  value,
  active,
}: {
  icon: typeof FileText;
  label: string;
  value: string;
  active?: boolean;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg border px-2.5 py-2",
        active ? "border-brand/20 bg-brand/5" : "border-white/8 bg-black/20",
      ].join(" ")}
    >
      <Icon className="h-3.5 w-3.5 shrink-0 text-white/35" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] text-white/40">{label}</p>
        <p className="text-xs font-semibold tabular-nums text-white/75">{value}</p>
      </div>
    </div>
  );
}
