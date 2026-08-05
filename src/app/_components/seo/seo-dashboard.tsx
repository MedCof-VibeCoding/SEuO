"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  Activity,
  BarChart3,
  ClipboardCheck,
  Database,
  FileText,
  Gauge,
  ListChecks,
  Search,
  Sparkles,
} from "lucide-react";
import { useMemo } from "react";
import { toast } from "sonner";

import {
  buildComparativeInsights,
  buildCompetitorSeoNarrative,
} from "~/features/seo/lib/comparative-display";
import { CATEGORY_LABELS } from "~/features/seo/services/comparison-engine";
import type { SeoAnalysisReport, SeoCategory, SeoInsight } from "~/features/seo/types/analysis";

import { downloadReportTxt } from "~/features/seo/lib/export-report-txt";
import { PLAN_LIMITS } from "~/features/seo/constants/plans";

import { ComparativeSearchConsoleSection } from "./comparative-search-console-section";
import { AiRecommendationPanel } from "./ai-recommendation-panel";
import {
  ArticleActionPlanBlock,
  ArticleCollectionBlock,
  ArticleKeywordsBlock,
  ArticleOnPageBlock,
} from "./comparative-article-panel";
import { SeoBarChart } from "./charts/seo-bar-chart";
import { SeoRadarChart } from "./charts/seo-radar-chart";
import { CompetitorAdvantagePanel } from "./competitor-advantage-panel";
import { IntelligenceScoreGrid } from "./intelligence-score-grid";
import { KeywordGapTable } from "./keyword-gap-table";
import { ScoreRing } from "./score-ring";
import { SeoImpactCard } from "./seo-impact-card";

import { CategoryRanking } from "./report/category-ranking";
import { CopyButton } from "./report/copy-button";
import { InsightsBoard } from "./report/insights-board";
import { PlanChecklist } from "./report/plan-checklist";
import { ReportNav, type ReportNavItem } from "./report/report-nav";
import { ReportSection, SubPanel } from "./report/report-section";
import { ReportSectionsProvider } from "./report/report-sections-context";
import { ReportSummary } from "./report/report-summary";
import { ReportToolbar } from "./report/report-toolbar";

type SeoDashboardProps = {
  report: SeoAnalysisReport;
};

const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS) as SeoCategory[];
const COMPARATIVE_CATEGORY_ORDER: SeoCategory[] = ["technical", "content", "ux"];
const COLLAPSED_SECTIONS = ["coleta", "conteudo", "auditoria"];

/**
 * Relatório SEO navegável: resumo executivo, seções recolhíveis e plano acionável.
 */
export function SeoDashboard({ report }: SeoDashboardProps) {
  const isPro = report.userPlan === "pro";
  const canExportPdf = PLAN_LIMITS[report.userPlan].exportPdf;
  const article = report.comparativeArticle;
  const isComparative = Boolean(article);
  const categoryOrder = isComparative ? COMPARATIVE_CATEGORY_ORDER : CATEGORY_ORDER;
  const primary = report.domains.find((domain) => domain.role === "primary");
  const targetLabel = report.targetUrl ?? article?.targetUrl ?? report.primaryDomain;
  const mainKeyword = report.mainKeyword ?? article?.mainKeyword;
  const hasAudit = !isComparative && report.issueDetails.length > 0;
  const hasPerformance = isComparative || Boolean(report.serpPosition);

  const intelligentInsights: SeoInsight[] = article
    ? buildComparativeInsights(article)
    : report.insights;

  const navItems = useMemo<ReportNavItem[]>(() => {
    const items: ReportNavItem[] = [{ id: "resumo", label: "Resumo", icon: Gauge }];
    if (isComparative) items.push({ id: "coleta", label: "Coleta de dados", icon: Database });
    if (hasPerformance) {
      items.push({ id: "desempenho", label: "Desempenho real", icon: Activity });
    }
    items.push({ id: "scores", label: "Scores e ranking", icon: BarChart3 });
    items.push({ id: "palavras-chave", label: "Palavras-chave", icon: Search });
    items.push({ id: "conteudo", label: "Conteúdo", icon: FileText });
    if (hasAudit) items.push({ id: "auditoria", label: "Auditoria", icon: ClipboardCheck });
    items.push({ id: "oportunidades", label: "Oportunidades", icon: Sparkles });
    items.push({ id: "plano", label: "Plano de ação", icon: ListChecks });
    return items;
  }, [isComparative, hasPerformance, hasAudit]);

  const sectionIds = useMemo(() => navItems.map((item) => item.id), [navItems]);
  const stepOf = (id: string) => sectionIds.indexOf(id) + 1;

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
    <ReportSectionsProvider sectionIds={sectionIds} collapsedIds={COLLAPSED_SECTIONS}>
      <div className="mx-auto max-w-7xl px-4 pb-24 sm:px-6">
        <motion.header
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="no-print flex flex-col gap-3 pb-5 pt-8 sm:flex-row sm:items-end sm:justify-between"
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-bright">
              Análise concluída
            </p>
            <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
              {isComparative ? "Análise comparativa" : "Benchmark SEO"}
            </h1>
            <p className="mt-1.5 text-sm text-white/45">
              {new Date(report.createdAt).toLocaleString("pt-BR")} · {report.domains.length}{" "}
              {isComparative ? "páginas" : "domínios"} ·{" "}
              <span
                className={
                  isPro ? "text-brand-bright" : "rounded bg-white/10 px-1.5 text-white/60"
                }
              >
                {isPro ? "Pro" : "Free"}
              </span>
            </p>
          </div>
          {!isComparative ? (
            <Link
              href={`/reports/${report.shareSlug}`}
              className="inline-flex w-fit rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Relatório detalhado
            </Link>
          ) : null}
        </motion.header>

        <ReportToolbar
          score={primary?.overallScore ?? 0}
          targetLabel={targetLabel}
          mainKeyword={mainKeyword}
          exportLabel={isComparative ? "Exportar .txt" : "Exportar PDF"}
          onExport={handleExport}
        />

        <div className="mt-6 lg:grid lg:grid-cols-[196px_minmax(0,1fr)] lg:gap-8">
          <ReportNav items={navItems} />

          <div className="flex min-w-0 flex-col gap-4">
            <ReportSummary report={report} categories={categoryOrder} />

            {article ? (
              <ReportSection
                id="coleta"
                step={stepOf("coleta")}
                icon={Database}
                title="Coleta de dados"
                description="Páginas analisadas, evidências coletadas e contexto informado."
                badge={`${report.domains.length} páginas`}
              >
                <ArticleCollectionBlock article={article} />
              </ReportSection>
            ) : null}

            {hasPerformance ? (
              <ReportSection
                id="desempenho"
                step={stepOf("desempenho")}
                icon={Activity}
                title="Desempenho real da página"
                description="Métricas observadas nas ferramentas conectadas, sem estimativas."
              >
                {isComparative ? (
                  <SubPanel
                    title="Search Console"
                    description="Desempenho, audiência (país/dispositivo), indexação, sitemaps, inspeção de URL, links e segurança."
                  >
                    <ComparativeSearchConsoleSection
                      initialData={report.searchConsole}
                      targetUrl={targetLabel}
                      mainKeyword={mainKeyword}
                    />
                  </SubPanel>
                ) : (
                  <Link
                    href="/google-position-checker"
                    className="inline-flex rounded-xl border border-brand/40 bg-brand/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/30"
                  >
                    Verificar posição no Google →
                  </Link>
                )}
              </ReportSection>
            ) : null}

            <ReportSection
              id="scores"
              step={stepOf("scores")}
              icon={BarChart3}
              title="Scores e ranking"
              description="Como sua página se compara em cada dimensão avaliada."
            >
              <div>
                <SubPanel
                  title="Qualidade de SEO"
                  description="Score geral de cada página analisada."
                >
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {report.domains.map((domain) => (
                      <div key={domain.domain} className="flex flex-col items-center py-2">
                        <ScoreRing
                          score={domain.overallScore}
                          label={domain.domain}
                          highlight={domain.role === "primary"}
                          size={96}
                        />
                        <span className="mt-3 rounded-full bg-white/5 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white/45">
                          #{domain.rank} ·{" "}
                          {domain.role === "primary" ? "Sua página" : "Concorrente"}
                        </span>
                      </div>
                    ))}
                  </div>
                </SubPanel>

                <SubPanel
                  title="Scores de inteligência"
                  description="Leitura qualitativa do conteúdo e da base técnica."
                >
                  <IntelligenceScoreGrid
                    scores={report.intelligenceScores}
                    hideKeys={isComparative ? ["authority"] : undefined}
                  />
                </SubPanel>

                <SubPanel title="Comparativo visual">
                  <div className="grid gap-6 lg:grid-cols-2">
                    <SeoBarChart domains={report.domains} />
                    <SeoRadarChart domains={report.domains} categories={categoryOrder} />
                  </div>
                </SubPanel>

                <SubPanel
                  title="Ranking por categoria"
                  description="Barras verdes indicam a página líder de cada categoria."
                >
                  <CategoryRanking
                    domains={report.domains}
                    winners={report.winners}
                    categories={categoryOrder}
                  />
                </SubPanel>
              </div>
            </ReportSection>

            <ReportSection
              id="palavras-chave"
              step={stepOf("palavras-chave")}
              icon={Search}
              title="Palavras-chave"
              description="Termos que sustentam o ranqueamento e os que faltam na sua página."
              badge={`${report.keywordGaps.length} gaps`}
            >
              <div>
                {article ? (
                  <SubPanel title="Mapa de palavras-chave do artigo">
                    <ArticleKeywordsBlock keywords={article.keywords} />
                  </SubPanel>
                ) : null}
                <SubPanel
                  title="Gaps de palavras-chave"
                  description="Termos usados pelos concorrentes que ainda não aparecem no seu texto."
                >
                  <KeywordGapTable gaps={report.keywordGaps} />
                </SubPanel>
              </div>
            </ReportSection>

            <ReportSection
              id="conteudo"
              step={stepOf("conteudo")}
              icon={FileText}
              title="Conteúdo e diferenciais"
              description="Padrões on-page, lacunas de conteúdo e vantagens dos concorrentes."
            >
              <div>
                {article ? (
                  <SubPanel title="Padrões de conteúdo e on-page">
                    <ArticleOnPageBlock content={article.content} />
                  </SubPanel>
                ) : null}

                <SubPanel
                  title="Estratégia de conteúdo"
                  description="Sugestões práticas para melhorar o artigo analisado."
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      {
                        title: "O que falta no seu texto",
                        items: report.contentStrategy.missingTopics,
                      },
                      {
                        title: "Como melhorar o conteúdo atual",
                        items: report.contentStrategy.semanticGaps,
                      },
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
                        <StrategyList
                          key={section.title}
                          title={section.title}
                          items={section.items}
                        />
                      ))}
                  </div>
                </SubPanel>

                <SubPanel title="Por que concorrentes performam melhor">
                  <CompetitorAdvantagePanel
                    items={report.competitorAdvantages}
                    narrative={article ? buildCompetitorSeoNarrative(article) : undefined}
                  />
                </SubPanel>

                {!isComparative ? (
                  <SubPanel title="SEO Copywriting Intelligence">
                    <AiRecommendationPanel
                      content={report.contentIntelligence}
                      aiNarrative={report.aiNarrative}
                      aiProvider={report.aiProvider}
                      isPro={isPro}
                    />
                  </SubPanel>
                ) : null}
              </div>
            </ReportSection>

            {hasAudit ? (
              <ReportSection
                id="auditoria"
                step={stepOf("auditoria")}
                icon={ClipboardCheck}
                title="Auditoria consultiva"
                description="Cada problema explicado, com exemplo bom e ruim."
                badge={`${report.issueDetails.length} problemas`}
              >
                <div className="flex flex-col gap-4">
                  {report.issueDetails.map((issue, index) => (
                    <SeoImpactCard key={issue.id} issue={issue} locked={!isPro && index >= 3} />
                  ))}
                </div>
                {!isPro ? (
                  <p className="mt-4 text-center text-sm text-white/45">
                    Plano Free: 3 diagnósticos completos.{" "}
                    <Link href="/settings" className="text-brand-bright hover:underline">
                      Upgrade Pro
                    </Link>{" "}
                    para ver todos.
                  </p>
                ) : null}
              </ReportSection>
            ) : null}

            <ReportSection
              id="oportunidades"
              step={stepOf("oportunidades")}
              icon={Sparkles}
              title="Oportunidades"
              description="Quick wins e recomendações priorizadas por impacto e esforço."
              badge={`${intelligentInsights.length + report.recommendations.length} itens`}
            >
              <div>
                <SubPanel title="Insights inteligentes">
                  <InsightsBoard insights={intelligentInsights} />
                </SubPanel>

                <SubPanel title="O que otimizar agora">
                  <ul className="grid gap-3 sm:grid-cols-2">
                    {report.recommendations.map((recommendation) => (
                      <li
                        key={recommendation.id}
                        className="group rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 transition hover:border-brand/25 hover:bg-white/[0.04]"
                      >
                        <p className="font-medium leading-snug text-white/90">
                          {recommendation.title}
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-white/55">
                          {recommendation.description}
                        </p>
                        <div className="mt-3 flex items-center justify-between gap-2">
                          <div className="flex flex-wrap gap-1.5">
                            <span className="rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-bright">
                              Impacto {recommendation.impact}
                            </span>
                            <span className="rounded bg-white/8 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/45">
                              Esforço {recommendation.effort}
                            </span>
                          </div>
                          <span className="opacity-0 transition focus-within:opacity-100 group-hover:opacity-100">
                            <CopyButton
                              text={`${recommendation.title}\n${recommendation.description}`}
                            />
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </SubPanel>
              </div>
            </ReportSection>

            <ReportSection
              id="plano"
              step={stepOf("plano")}
              icon={ListChecks}
              title="Plano de ação"
              description="Da execução imediata ao roadmap de longo prazo."
            >
              <div>
                {article ? (
                  <SubPanel
                    title="Plano por horizonte"
                    description="Sequência recomendada de implementação."
                  >
                    <ArticleActionPlanBlock actionPlan={article.actionPlan} />
                  </SubPanel>
                ) : null}

                <SubPanel
                  title={`Plano de 30 dias${isPro ? "" : " (resumo Free)"}`}
                  description="Marque o que já foi feito — o progresso fica salvo neste navegador."
                >
                  <PlanChecklist
                    weeks={isPro ? report.plan30Days : report.plan30Days.slice(0, 2)}
                    storageKey={`seo-plan:${report.id}`}
                  />
                </SubPanel>
              </div>
            </ReportSection>

            {primary ? (
              <p className="no-print mt-4 text-center text-xs text-white/30">
                Dados simulados para demonstração · integre Lighthouse e PageSpeed em produção
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </ReportSectionsProvider>
  );
}

/**
 * Lista temática da estratégia de conteúdo.
 */
function StrategyList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <div className="mb-2.5 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-white/85">{title}</h4>
        <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold tabular-nums text-white/45">
          {items.length}
        </span>
      </div>
      <ul className="space-y-2 text-sm leading-relaxed text-white/60">
        {items.map((item) => (
          <li key={item} className="flex gap-2">
            <span
              className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-bright"
              aria-hidden
            />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
