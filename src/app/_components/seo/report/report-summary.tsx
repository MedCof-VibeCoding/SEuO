"use client";

import { ArrowRight, Crown, Target, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

import { CATEGORY_LABELS } from "~/features/seo/services/comparison-engine";
import type {
  SeoAnalysisReport,
  SeoCategory,
  SeoRecommendation,
} from "~/features/seo/types/analysis";

import { ScoreRing } from "../score-ring";
import { useReportSections } from "./report-sections-context";

const IMPACT_WEIGHT = { high: 3, medium: 2, low: 1 } as const;
const EFFORT_WEIGHT = { low: 3, medium: 2, high: 1 } as const;

type ReportSummaryProps = {
  report: SeoAnalysisReport;
  categories: SeoCategory[];
};

/**
 * Resumo executivo: veredito da análise e as ações que devem vir primeiro.
 */
export function ReportSummary({ report, categories }: ReportSummaryProps) {
  const { open } = useReportSections();
  const primary = report.domains.find((domain) => domain.role === "primary");
  const leader = [...report.domains].sort((a, b) => b.overallScore - a.overallScore)[0];

  if (!primary) return null;

  const isLeading = primary.rank === 1;
  const gap = leader ? leader.overallScore - primary.overallScore : 0;
  const wonCategories = categories.filter(
    (category) =>
      report.winners.find((winner) => winner.category === category)?.domain ===
      primary.domain,
  );
  const priorities = [...report.recommendations]
    .sort(
      (a, b) =>
        IMPACT_WEIGHT[b.impact] - IMPACT_WEIGHT[a.impact] ||
        EFFORT_WEIGHT[b.effort] - EFFORT_WEIGHT[a.effort],
    )
    .slice(0, 3);

  const goToPlan = () => {
    open("plano");
    requestAnimationFrame(() => {
      document.getElementById("plano")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <section
      id="resumo"
      className="scroll-mt-32 overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar/90 shadow-[0_0_60px_-20px_var(--color-brand)] backdrop-blur-sm lg:scroll-mt-40"
    >
      <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[auto_minmax(0,1fr)] lg:gap-8">
        <div className="flex flex-row items-center gap-5 lg:flex-col lg:items-start">
          <ScoreRing
            score={primary.overallScore}
            label={primary.domain}
            highlight
            size={112}
          />
          <span
            className={[
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-wide",
              isLeading
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
                : "border-amber-400/30 bg-amber-400/10 text-amber-200",
            ].join(" ")}
          >
            {isLeading ? <Crown className="h-3.5 w-3.5" aria-hidden /> : null}
            {isLeading ? "Liderando" : `${gap} pts atrás`}
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-bright">
            Resumo executivo
          </p>
          <p className="mt-2 text-lg font-semibold leading-snug text-white sm:text-xl">
            {isLeading
              ? `Sua página lidera a comparação com ${primary.overallScore} pontos.`
              : `Sua página está em ${primary.rank}º lugar entre ${report.domains.length} páginas analisadas.`}
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/55">
            {isLeading
              ? `Você vence ${wonCategories.length} de ${categories.length} categorias. Mantenha a vantagem executando as ações abaixo.`
              : `Faltam ${gap} pontos para alcançar ${leader?.domain ?? "o líder"}. Você já lidera ${wonCategories.length} de ${categories.length} categorias.`}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <StatTile
              icon={Target}
              label="Posição"
              value={`${primary.rank}º de ${report.domains.length}`}
            />
            <StatTile
              icon={Crown}
              label="Categorias lideradas"
              value={`${wonCategories.length} de ${categories.length}`}
              hint={wonCategories.map((c) => CATEGORY_LABELS[c]).join(", ") || undefined}
            />
            <StatTile
              icon={TrendingUp}
              label="Ações recomendadas"
              value={String(report.recommendations.length)}
            />
          </div>

          {priorities.length ? (
            <div className="mt-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold text-white/85">Comece por aqui</h3>
                <button
                  type="button"
                  onClick={goToPlan}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-bright transition hover:gap-2"
                >
                  Ver plano completo
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                </button>
              </div>
              <ol className="grid gap-2.5">
                {priorities.map((recommendation, index) => (
                  <PriorityRow
                    key={recommendation.id}
                    index={index + 1}
                    recommendation={recommendation}
                  />
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * Indicador compacto do resumo executivo.
 */
function StatTile({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof Target;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div
      className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5"
      title={hint}
    >
      <div className="flex items-center gap-1.5 text-white/40">
        <Icon className="h-3.5 w-3.5" aria-hidden />
        <span className="text-[11px]">{label}</span>
      </div>
      <p className="mt-1.5 text-lg font-bold text-white">{value}</p>
    </div>
  );
}

/**
 * Linha de ação prioritária com impacto e esforço.
 */
function PriorityRow({
  index,
  recommendation,
}: {
  index: number;
  recommendation: SeoRecommendation;
}) {
  return (
    <li className="flex gap-3 rounded-xl border border-brand/15 bg-brand/[0.05] p-3.5">
      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/25 text-[11px] font-bold text-white">
        {index}
      </span>
      <div className="min-w-0">
        <p className="text-sm font-medium text-white/90">{recommendation.title}</p>
        <p className="mt-1 text-xs leading-relaxed text-white/50">
          {recommendation.description}
        </p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <Chip tone="impact">Impacto {recommendation.impact}</Chip>
          <Chip tone="effort">Esforço {recommendation.effort}</Chip>
        </div>
      </div>
    </li>
  );
}

/**
 * Etiqueta de impacto ou esforço.
 */
function Chip({ tone, children }: { tone: "impact" | "effort"; children: ReactNode }) {
  return (
    <span
      className={[
        "rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        tone === "impact"
          ? "bg-brand/20 text-brand-bright"
          : "bg-white/8 text-white/45",
      ].join(" ")}
    >
      {children}
    </span>
  );
}
