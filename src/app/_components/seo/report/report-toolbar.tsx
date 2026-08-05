"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { ChevronsDownUp, ChevronsUpDown, Download } from "lucide-react";

import { useReportSections } from "./report-sections-context";

type ReportToolbarProps = {
  score: number;
  targetLabel: string;
  mainKeyword?: string;
  exportLabel: string;
  onExport: () => void;
};

/**
 * Barra fixa com contexto da análise, progresso de leitura e ações do relatório.
 */
export function ReportToolbar({
  score,
  targetLabel,
  mainKeyword,
  exportLabel,
  onExport,
}: ReportToolbarProps) {
  const { allOpen, openAll, closeAll } = useReportSections();
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 24,
    restDelta: 0.001,
  });

  const ToggleIcon = allOpen ? ChevronsDownUp : ChevronsUpDown;

  return (
    <div className="no-print sticky top-14 z-30 -mx-4 border-b border-white/[0.07] bg-shell/85 backdrop-blur-xl sm:top-16 sm:-mx-6">
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <span
          className={[
            "grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-sm font-bold tabular-nums",
            scoreTone(score),
          ].join(" ")}
          title={`Score geral ${score} de 100`}
        >
          {score}
        </span>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-white/85" title={targetLabel}>
            {targetLabel}
          </p>
          {mainKeyword ? (
            <p className="truncate text-xs text-white/40">
              Palavra-chave: {mainKeyword}
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={allOpen ? closeAll : openAll}
          className="hidden items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/5 hover:text-white/85 sm:inline-flex"
        >
          <ToggleIcon className="h-3.5 w-3.5" aria-hidden />
          {allOpen ? "Recolher tudo" : "Expandir tudo"}
        </button>

        <button
          type="button"
          onClick={onExport}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-brand/40 bg-brand/20 px-3 py-2 text-xs font-semibold text-white transition hover:bg-brand/30"
        >
          <Download className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">{exportLabel}</span>
          <span className="sm:hidden">Exportar</span>
        </button>
      </div>

      <motion.div
        className="h-0.5 origin-left bg-brand-bright"
        style={{ scaleX: progress }}
        aria-hidden
      />
    </div>
  );
}

/**
 * Cor do selo de score conforme a faixa de desempenho.
 */
function scoreTone(score: number): string {
  if (score >= 75) return "border-emerald-400/35 bg-emerald-400/10 text-emerald-200";
  if (score >= 50) return "border-amber-400/35 bg-amber-400/10 text-amber-200";
  return "border-brand/40 bg-brand/15 text-brand-bright";
}
