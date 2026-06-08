"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  Lightbulb,
  MousePointerClick,
  TrendingUp,
} from "lucide-react";

import { RankBadge } from "~/app/google-position-checker/_components/rank-badge";
import { RankingChart } from "~/app/google-position-checker/_components/ranking-chart";
import { RelatedKeywordsPanel } from "~/app/google-position-checker/_components/related-keywords-panel";
import type { GooglePositionCheckResult } from "~/features/seo/types/google-position-check";

type ResultDashboardProps = {
  result: GooglePositionCheckResult;
};

function SeoScoreRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (score / 100) * circumference;
  const color =
    score >= 70
      ? "var(--color-brand-bright)"
      : score >= 45
        ? "var(--color-brand)"
        : "#f87171";

  return (
    <div className="relative mx-auto h-28 w-28">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden>
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] uppercase tracking-wider text-white/45">SEO</span>
      </div>
    </div>
  );
}

/**
 * Dashboard de resultado da verificação de posição.
 */
export function ResultDashboard({ result }: ResultDashboardProps) {
  const checkedLabel = new Date(result.checkedAt).toLocaleString("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="space-y-6"
    >
      {!result.found ? (
        <div
          className="rounded-2xl border border-amber-500/25 bg-amber-500/8 px-5 py-4 text-sm leading-relaxed text-amber-100/90"
          role="alert"
        >
          {result.dataSource === "search_console"
            ? "Sem impressões no Search Console para esta URL e palavra-chave nos últimos 28 dias."
            : "Esta página não foi encontrada nas primeiras 100 posições do Google para esta palavra-chave."}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <RankBadge tier={result.rankTier} />
          {result.dataSource === "search_console" ? (
            <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-bright">
              Search Console
            </span>
          ) : null}
        </div>
        {result.found && result.position !== null ? (
          <p className="text-3xl font-bold tabular-nums text-white">
            <span className="text-lg font-normal text-white/45">#</span>
            {result.position}
          </p>
        ) : (
          <p className="text-lg font-semibold text-white/50">Sem posição orgânica</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={BarChart3}
          label={result.dataSource === "search_console" ? "Impressões" : "Volume de busca"}
          value={result.searchVolumeLabel}
        />
        <MetricCard
          icon={TrendingUp}
          label="Concorrência"
          value={result.competitionLabel}
        />
        <MetricCard
          icon={MousePointerClick}
          label="CTR estimado"
          value={`${result.estimatedCtr.toFixed(1)}%`}
        />
        <MetricCard icon={Calendar} label="Consulta" value={checkedLabel} compact />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 rounded-2xl border border-white/10 bg-black/25 p-5 lg:col-span-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-white/85">
            <FileText className="h-4 w-4 text-brand-bright" aria-hidden />
            Snippet na SERP
          </h3>
          <div>
            <p className="text-lg font-medium text-brand-bright/95">{result.pageTitle}</p>
            <p className="mt-1 text-xs text-brand-bright/80">{result.foundUrl}</p>
            <p className="mt-2 text-sm leading-relaxed text-white/55">{result.metaDescription}</p>
          </div>
          <div className="flex flex-wrap gap-4 border-t border-white/8 pt-4 text-xs text-white/50">
            <span className="flex items-center gap-1.5">
              <Globe className="h-3.5 w-3.5" aria-hidden />
              URL consultada:{" "}
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-bright hover:underline"
              >
                {result.url}
              </a>
            </span>
            <a
              href={`https://www.google.com/search?q=${encodeURIComponent(result.keyword)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-bright hover:underline"
            >
              Ver no Google <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-brand/20 bg-brand/5 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/50">
            Score SEO da página
          </p>
          <SeoScoreRing score={result.seoScore} />
        </div>
      </div>

      {result.relatedKeywords.length > 0 ? (
        <RelatedKeywordsPanel
          keywords={result.relatedKeywords}
          primaryKeyword={result.keyword}
        />
      ) : null}

      <div className="rounded-2xl border border-white/10 bg-black/25 p-5">
        <h3 className="mb-4 text-sm font-semibold text-white/85">Evolução de ranking (6 meses)</h3>
        <RankingChart data={result.rankingHistory} />
        <p className="mt-2 text-[10px] text-white/35">
          {result.dataSource === "search_console"
            ? `Evolução diária — ${result.gscProperty ?? "Search Console"}`
            : "Dados simulados"}
        </p>
      </div>

      <div className="flex gap-3 rounded-2xl border border-brand/20 bg-brand/5 px-4 py-3">
        <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-brand-bright" aria-hidden />
        <p className="text-sm leading-relaxed text-white/70">{result.suggestion}</p>
      </div>
    </motion.div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  compact,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
  compact?: boolean;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-white/45">
        <Icon className="h-3.5 w-3.5 text-brand-bright/80" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p
        className={
          compact
            ? "mt-1 text-xs font-medium text-white/80"
            : "mt-1 text-lg font-bold text-white"
        }
      >
        {value}
      </p>
    </div>
  );
}
