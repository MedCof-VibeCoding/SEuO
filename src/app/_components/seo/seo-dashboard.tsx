"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { toast } from "sonner";

import {
  buildComparativeInsights,
  buildCompetitorSeoNarrative,
} from "~/features/seo/lib/comparative-display";
import { CATEGORY_LABELS } from "~/features/seo/services/comparison-engine";
import type { SeoAnalysisReport, SeoCategory, SeoInsight } from "~/features/seo/types/analysis";

import { downloadReportTxt } from "~/features/seo/lib/export-report-txt";
import { PLAN_LIMITS } from "~/features/seo/constants/plans";

import { AiRecommendationPanel } from "./ai-recommendation-panel";
import { ComparativeArticlePanel } from "./comparative-article-panel";
import { SeoBarChart } from "./charts/seo-bar-chart";
import { SeoRadarChart } from "./charts/seo-radar-chart";
import { CompetitorAdvantagePanel } from "./competitor-advantage-panel";
import { IntelligenceScoreGrid } from "./intelligence-score-grid";
import { KeywordGapTable } from "./keyword-gap-table";
import { ScoreRing } from "./score-ring";
import { SeoImpactCard } from "./seo-impact-card";
import { SeoPanel } from "./seo-panel";

type SeoDashboardProps = {
  report: SeoAnalysisReport;
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as SeoCategory[];

/**
 * Dashboard comparativo completo com gráficos, insights e recomendações.
 */
export function SeoDashboard({ report }: SeoDashboardProps) {
  const isPro = report.userPlan === "pro";
  const canExportPdf = PLAN_LIMITS[report.userPlan].exportPdf;
  const primary = report.domains.find((d) => d.role === "primary");
  const isComparative = Boolean(report.comparativeArticle);

  const intelligentInsights: SeoInsight[] = report.comparativeArticle
    ? buildComparativeInsights(report.comparativeArticle)
    : report.insights;

  const handleExport = () => {
    if (isComparative) {
      downloadReportTxt(report);
      toast.success("Relatório exportado em .txt");
      return;
    }
    if (!canExportPdf) {
      toast.error("Exportar PDF disponível no plano Pro.");
      return;
    }
    window.print();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-20 sm:px-6 sm:py-10">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="no-print mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-seo-accent-bright">
            Análise concluída
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
            {report.comparativeArticle ? "Análise comparativa" : "Benchmark SEO"}
          </h1>
          <p className="mt-1 text-sm text-white/50">
            {new Date(report.createdAt).toLocaleString("pt-BR")} · {report.domains.length}{" "}
            {report.comparativeArticle ? "páginas" : "domínios"} ·{" "}
            <span
              className={
                isPro ? "text-seo-accent-bright" : "rounded bg-white/10 px-1.5 text-white/60"
              }
            >
              {isPro ? "Pro" : "Free"}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {!isComparative ? (
            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg border border-white/12 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-white/5"
            >
              Exportar PDF
            </button>
          ) : (
            <button
              type="button"
              onClick={handleExport}
              className="rounded-lg border border-brand/40 bg-brand/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/30"
            >
              Exportar relatório (.txt)
            </button>
          )}
          {!isComparative ? (
            <Link
              href={`/reports/${report.shareSlug}`}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Relatório detalhado
            </Link>
          ) : null}
        </div>
      </motion.div>

      {report.comparativeArticle ? (
        <div className="mb-10">
          <ComparativeArticlePanel article={report.comparativeArticle} />
        </div>
      ) : null}

      <SeoPanel delay={40} className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-white/80">Qualidade de SEO</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {report.domains.map((d, i) => (
            <div key={d.domain} className="flex flex-col items-center py-4">
              <ScoreRing
                score={d.overallScore}
                label={d.domain}
                highlight={d.role === "primary"}
                size={96}
              />
              <span className="mt-3 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/45">
                #{d.rank} · {d.role === "primary" ? "Alvo" : "Concorrente"}
              </span>
            </div>
          ))}
        </div>
      </SeoPanel>

      <SeoPanel delay={60} className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-white/80">
          Posicionamento no Google
        </h2>
        <p className="mb-3 text-sm text-white/50">
          Consulte posições orgânicas e SERP simulada por palavra-chave.
        </p>
        <Link
          href="/google-position-checker"
          className="inline-flex rounded-xl border border-brand/40 bg-brand/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/30"
        >
          Verificar posição no Google →
        </Link>
      </SeoPanel>

      <SeoPanel delay={80} className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-white/80">
          Scores de inteligência
        </h2>
        <IntelligenceScoreGrid scores={report.intelligenceScores} />
      </SeoPanel>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <SeoPanel delay={100}>
          <h2 className="mb-4 text-sm font-semibold text-white/80">Score geral</h2>
          <SeoBarChart domains={report.domains} />
        </SeoPanel>
        <SeoPanel delay={160}>
          <h2 className="mb-4 text-sm font-semibold text-white/80">Comparativo por categoria</h2>
          <SeoRadarChart domains={report.domains} />
        </SeoPanel>
      </div>

      <SeoPanel delay={200} className="mb-8 overflow-x-auto">
        <h2 className="mb-4 text-sm font-semibold text-white/80">Ranking por categoria</h2>
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <th className="pb-3 pr-4 font-medium">Categoria</th>
              {report.domains.map((d) => (
                <th key={d.domain} className="pb-3 pr-4 font-medium">
                  {d.domain}
                </th>
              ))}
              <th className="pb-3 font-medium">Líder</th>
            </tr>
          </thead>
          <tbody>
            {CATEGORY_ORDER.map((cat) => {
              const winner = report.winners.find((w) => w.category === cat);
              return (
                <tr key={cat} className="border-b border-white/[0.04]">
                  <td className="py-3 pr-4 text-white/70">{CATEGORY_LABELS[cat]}</td>
                  {report.domains.map((d) => {
                    const score = d.categoryScores[cat];
                    const isWinner = winner?.domain === d.domain;
                    return (
                      <td
                        key={d.domain}
                        className={[
                          "py-3 pr-4 font-mono tabular-nums",
                          isWinner ? "font-semibold text-seo-success" : "text-white/55",
                        ].join(" ")}
                      >
                        {score}
                        {isWinner ? " ↑" : ""}
                      </td>
                    );
                  })}
                  <td className="py-3 text-xs text-white/45">
                    {winner?.domain ?? "—"}
                    {winner && winner.marginPercent !== 0 ? (
                      <span className="ml-1 text-white/30">
                        ({winner.marginPercent > 0 ? "+" : ""}
                        {winner.marginPercent}%)
                      </span>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </SeoPanel>

      {!report.comparativeArticle && report.issueDetails.length > 0 ? (
        <SeoPanel delay={220} className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-white/80">
            Auditoria consultiva — cada problema explicado
          </h2>
          <div className="flex flex-col gap-4">
            {report.issueDetails.map((issue, i) => (
              <SeoImpactCard
                key={issue.id}
                issue={issue}
                locked={!isPro && i >= 3}
              />
            ))}
          </div>
          {!isPro ? (
            <p className="mt-4 text-center text-sm text-white/45">
              Plano Free: 3 diagnósticos completos.{" "}
              <Link href="/settings" className="text-seo-accent-bright hover:underline">
                Upgrade Pro
              </Link>{" "}
              para ver todos.
            </p>
          ) : null}
        </SeoPanel>
      ) : null}

      <SeoPanel delay={240} className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-white/80">
          Por que concorrentes performam melhor
        </h2>
        <CompetitorAdvantagePanel
          items={report.competitorAdvantages}
          narrative={
            report.comparativeArticle
              ? buildCompetitorSeoNarrative(report.comparativeArticle)
              : undefined
          }
        />
      </SeoPanel>

      {!report.comparativeArticle ? (
        <SeoPanel delay={260} className="mb-8">
          <h2 className="mb-4 text-sm font-semibold text-white/80">
            SEO Copywriting Intelligence
          </h2>
          <AiRecommendationPanel
            content={report.contentIntelligence}
            aiNarrative={report.aiNarrative}
            aiProvider={report.aiProvider}
            isPro={isPro}
          />
        </SeoPanel>
      ) : null}

      <SeoPanel delay={270} className="mb-8">
        <h2 className="mb-4 text-sm font-semibold text-white/80">Gaps de palavras-chave</h2>
        <KeywordGapTable gaps={report.keywordGaps} />
      </SeoPanel>

      <SeoPanel delay={275} className="mb-8">
        <h2 className="mb-2 text-sm font-semibold text-white/80">Estratégia de conteúdo</h2>
        <p className="mb-4 text-sm text-white/45">
          Sugestões práticas para melhorar o artigo que você analisou.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { title: "O que falta no seu texto", items: report.contentStrategy.missingTopics },
            { title: "Como melhorar o conteúdo atual", items: report.contentStrategy.semanticGaps },
            {
              title: "Palavras que os concorrentes usam",
              items: report.contentStrategy.competitorKeywords,
            },
            {
              title: "Perguntas que seu texto deveria responder",
              items: report.contentStrategy.userQuestions,
            },
          ]
            .filter((section) => section.items.length > 0)
            .map((section) => (
              <StrategyList key={section.title} title={section.title} items={section.items} />
            ))}
        </div>
      </SeoPanel>

      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        <SeoPanel delay={280}>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white/80">
            <span className="text-seo-accent-bright">✦</span> Insights inteligentes
          </h2>
          <p className="mb-4 text-sm text-white/45">
            Quick wins e oportunidades de conteúdo para o artigo analisado.
          </p>
          {intelligentInsights.length === 0 ? (
            <p className="text-sm text-white/45">Nenhum insight identificado nesta análise.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {intelligentInsights.map((insight) => (
                <li
                  key={insight.id}
                  className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-white/10"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-white/90">{insight.title}</p>
                    <span
                      className={[
                        "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase",
                        insight.type === "win"
                          ? "bg-brand/20 text-brand-bright"
                          : "bg-white/10 text-white/55",
                      ].join(" ")}
                    >
                      {insight.type === "win" ? "Quick win" : "Conteúdo"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    {insight.description}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SeoPanel>

        <SeoPanel delay={280}>
          <h2 className="mb-4 text-sm font-semibold text-white/80">O que otimizar agora</h2>
          <ul className="flex flex-col gap-3">
            {report.recommendations.map((rec) => (
              <li
                key={rec.id}
                className="rounded-xl border border-seo-panel-border bg-seo-accent/[0.06] p-4"
              >
                <p className="font-medium text-white">{rec.title}</p>
                <p className="mt-1 text-sm text-white/55">{rec.description}</p>
                <div className="mt-2 flex gap-2 text-[10px] font-semibold uppercase tracking-wide">
                  <span className="text-seo-success">Impacto {rec.impact}</span>
                  <span className="text-white/35">·</span>
                  <span className="text-white/45">Esforço {rec.effort}</span>
                </div>
              </li>
            ))}
          </ul>
        </SeoPanel>
      </div>

      <SeoPanel delay={320}>
        <h2 className="mb-4 text-sm font-semibold text-white/80">
          Plano SEO — 30 dias {isPro ? "" : "(resumo Free)"}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {(isPro ? report.plan30Days : report.plan30Days.slice(0, 2)).map((week) => (
            <div
              key={week.week}
              className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            >
              <p className="text-xs font-bold text-seo-accent-bright">Semana {week.week}</p>
              <p className="mt-1 font-semibold text-white/90">{week.focus}</p>
              <ul className="mt-3 list-inside list-disc text-sm text-white/50">
                {week.tasks.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </SeoPanel>

      {primary ? (
        <p className="no-print mt-8 text-center text-xs text-white/35">
          Dados simulados para demonstração · integre Lighthouse e PageSpeed em produção
        </p>
      ) : null}
    </div>
  );
}

function StrategyList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <h4 className="text-sm font-semibold text-white/80">{title}</h4>
      <ul className="mt-2 list-inside list-disc text-sm text-white/55">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
