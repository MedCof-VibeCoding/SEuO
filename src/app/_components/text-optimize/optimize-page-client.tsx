"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { SeoPanel } from "~/app/_components/seo/seo-panel";
import { ContentQualityRadar } from "~/app/_components/text-optimize/content-quality-radar";
import { DiffViewer } from "~/app/_components/text-optimize/diff-viewer";
import { MetricsComparisonTable } from "~/app/_components/text-optimize/metrics-comparison-table";
import { OptimizationChangesPanel } from "~/app/_components/text-optimize/optimization-changes-panel";
import { ReadabilityGauge } from "~/app/_components/text-optimize/readability-gauge";
import { SeoScoreCard } from "~/app/_components/text-optimize/seo-score-card";
import { analyzeTextMetrics } from "~/features/text-optimize/services/text-metrics";
import type {
  OptimizationMode,
  SearchIntent,
  TextOptimizeResult,
  VoiceTone,
} from "~/features/text-optimize/types";

const DEMO_TEXT = `Nossa agência de marketing digital ajuda empresas a crescer na internet com estratégias de SEO, mídia paga e conteúdo. Trabalhamos com times enxutos e entregamos relatórios mensais para você acompanhar resultados.

Se você busca mais tráfego orgânico e leads qualificados, podemos estruturar um plano sob medida. Entre em contato e solicite uma proposta.`;

const HISTORY_KEY = "text-optimize-history";

type HistoryEntry = {
  id: string;
  createdAt: string;
  preview: string;
  result: TextOptimizeResult;
};

/**
 * Página interativa de otimização de texto SEO com IA.
 */
export function OptimizePageClient() {
  const [text, setText] = useState("");
  const [mode, setMode] = useState<OptimizationMode>("balanced");
  const [tone, setTone] = useState<VoiceTone>("professional");
  const [searchIntent, setSearchIntent] = useState<SearchIntent>("informational");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [featuredSnippet, setFeaturedSnippet] = useState(false);
  const [generateFaqs, setGenerateFaqs] = useState(true);
  const [eeatFocus, setEeatFocus] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TextOptimizeResult | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [showDemo, setShowDemo] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(HISTORY_KEY);
      if (raw) setHistory(JSON.parse(raw) as HistoryEntry[]);
    } catch {
      /* ignore */
    }
  }, []);

  const liveMetrics = useMemo(
    () => (text.trim().length >= 20 ? analyzeTextMetrics(text, targetKeyword || undefined) : null),
    [text, targetKeyword],
  );

  const issues = useMemo(() => {
    if (!liveMetrics) return [];
    const list: string[] = [];
    if (liveMetrics.avgSentenceLength > 28) {
      list.push("Frases longas reduzem escaneabilidade.");
    }
    if (liveMetrics.headingCount === 0 && liveMetrics.wordCount > 120) {
      list.push("Falta estrutura de headings (H1/H2/H3).");
    }
    if (targetKeyword && liveMetrics.keywordCoverage < 40) {
      list.push("Palavra-chave principal com baixa cobertura.");
    }
    if (liveMetrics.seoScore < 55) {
      list.push("SEO score abaixo do ideal para ranqueamento.");
    }
    return list;
  }, [liveMetrics, targetKeyword]);

  const runOptimize = useCallback(async () => {
    if (text.trim().length < 80) {
      toast.error("Cole pelo menos 80 caracteres de texto.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/seo/optimize-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          mode,
          tone,
          searchIntent,
          targetKeyword: targetKeyword || undefined,
          featuredSnippet,
          generateFaqs,
          eeatFocus,
        }),
      });
      const data = (await res.json()) as {
        result?: TextOptimizeResult;
        error?: string;
      };
      if (!res.ok) {
        toast.error("Não foi possível otimizar o texto.");
        return;
      }
      if (!data.result) return;
      setResult(data.result);
      const entry: HistoryEntry = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        preview: text.slice(0, 80),
        result: data.result,
      };
      setHistory((h) => {
        const next = [entry, ...h].slice(0, 8);
        sessionStorage.setItem(HISTORY_KEY, JSON.stringify(next));
        return next;
      });
      toast.success(
        data.result.aiPowered
          ? "Texto otimizado com IA"
          : "Texto otimizado (modo editorial local)",
      );
    } catch {
      toast.error("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  }, [
    text,
    mode,
    tone,
    searchIntent,
    targetKeyword,
    featuredSnippet,
    generateFaqs,
    eeatFocus,
  ]);

  const copyOptimized = useCallback(() => {
    if (!result?.optimizedText) return;
    void navigator.clipboard.writeText(result.optimizedText);
    toast.success("Copiado!");
  }, [result]);

  const downloadMarkdown = useCallback(() => {
    if (!result?.optimizedText) return;
    const blob = new Blob([result.optimizedText], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "texto-otimizado-seo.md";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const downloadHtml = useCallback(() => {
    if (!result?.optimizedText) return;
    const body = result.optimizedText
      .replace(/^### (.+)$/gm, "<h3>$1</h3>")
      .replace(/^## (.+)$/gm, "<h2>$1</h2>")
      .replace(/^# (.+)$/gm, "<h1>$1</h1>")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>");
    const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Texto otimizado</title></head><body><p>${body}</p></body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "texto-otimizado-seo.html";
    a.click();
    URL.revokeObjectURL(url);
  }, [result]);

  const restoreVersion = useCallback((entry: HistoryEntry) => {
    setResult(entry.result);
    toast.info("Versão restaurada do histórico");
  }, []);

  const undoToOriginal = useCallback(() => {
    if (!result) return;
    setResult(null);
    toast.info("Voltou ao texto original");
  }, [result]);

  return (
    <>
      <section className="mx-auto max-w-7xl px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-3xl"
        >
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-bright">
            SEO Copilot
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Otimize seu texto para SEO com IA
          </h1>
          <p className="mt-4 text-lg text-white/55">
            Melhore rankings, legibilidade e performance orgânica sem alterar a essência do
            seu conteúdo.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => document.getElementById("editor-split")?.scrollIntoView({ behavior: "smooth" })}
              className="rounded-xl border border-brand/45 bg-brand/35 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_-8px_var(--color-brand)] transition hover:bg-brand/50"
            >
              Testar agora
            </button>
            <button
              type="button"
              onClick={() => {
                setText(DEMO_TEXT);
                setShowDemo(true);
                setTargetKeyword("marketing digital");
                document.getElementById("editor-split")?.scrollIntoView({ behavior: "smooth" });
              }}
              className="rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:border-brand/35 hover:bg-brand/10"
            >
              Ver demonstração
            </button>
          </div>
        </motion.div>

        <div id="editor-split" className="mt-12 grid gap-4 lg:grid-cols-2">
          <SeoPanel className="flex flex-col">
            <h2 className="text-lg font-semibold text-white">Texto original</h2>
            <p className="mt-1 text-xs text-white/45">Markdown suportado · significado preservado</p>

            <div className="mt-4 flex flex-wrap gap-2">
              {(
                [
                  ["balanced", "Balanceado"],
                  ["seo_max", "SEO máximo"],
                  ["conversion", "Conversão"],
                  ["authority", "Autoridade"],
                ] as const
              ).map(([m, label]) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={
                    mode === m
                      ? "rounded-lg border border-brand/40 bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand-bright"
                      : "rounded-lg border border-white/10 px-2.5 py-1 text-xs text-white/55 hover:text-white"
                  }
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <select
                value={tone}
                onChange={(e) => setTone(e.target.value as VoiceTone)}
                className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-xs text-white"
              >
                <option value="neutral">Tom neutro</option>
                <option value="professional">Profissional</option>
                <option value="friendly">Amigável</option>
                <option value="authoritative">Autoridade</option>
              </select>
              <select
                value={searchIntent}
                onChange={(e) => setSearchIntent(e.target.value as SearchIntent)}
                className="rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-xs text-white"
              >
                <option value="informational">Informacional</option>
                <option value="commercial">Comercial</option>
                <option value="transactional">Transacional</option>
                <option value="navigational">Navegacional</option>
              </select>
            </div>

            <input
              type="text"
              placeholder="Palavra-chave principal (opcional)"
              value={targetKeyword}
              onChange={(e) => setTargetKeyword(e.target.value)}
              className="mt-2 rounded-lg border border-white/15 bg-black/25 px-3 py-2 text-sm text-white placeholder:text-white/35"
            />

            <label className="mt-2 flex items-center gap-2 text-xs text-white/55">
              <input
                type="checkbox"
                checked={featuredSnippet}
                onChange={(e) => setFeaturedSnippet(e.target.checked)}
                className="rounded border-white/25 text-brand"
              />
              Featured snippet
            </label>
            <label className="flex items-center gap-2 text-xs text-white/55">
              <input
                type="checkbox"
                checked={generateFaqs}
                onChange={(e) => setGenerateFaqs(e.target.checked)}
                className="rounded border-white/25 text-brand"
              />
              Gerar FAQs
            </label>
            <label className="flex items-center gap-2 text-xs text-white/55">
              <input
                type="checkbox"
                checked={eeatFocus}
                onChange={(e) => setEeatFocus(e.target.checked)}
                className="rounded border-white/25 text-brand"
              />
              Foco E-E-A-T
            </label>

            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Cole seu artigo, landing page ou post de blog…"
              className="mt-4 min-h-[280px] flex-1 resize-y rounded-xl border border-white/15 bg-black/25 p-4 font-mono text-sm leading-relaxed text-white placeholder:text-white/30 outline-none ring-brand/40 focus:border-brand/50 focus:ring-2"
            />

            <div className="mt-2 flex justify-between text-xs text-white/40">
              <span>{liveMetrics?.wordCount ?? 0} palavras</span>
              <span>{liveMetrics?.charCount ?? text.length} caracteres</span>
            </div>

            {liveMetrics ? (
              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
                <SeoScoreCard label="SEO" value={liveMetrics.seoScore} highlight />
                <SeoScoreCard label="Legibilidade" value={liveMetrics.readability} />
                <SeoScoreCard label="CTR est." value={`${liveMetrics.ctrEstimate}%`} />
                <SeoScoreCard label="Keywords" value={`${liveMetrics.keywordCoverage}%`} />
                <SeoScoreCard label="Headings" value={liveMetrics.headingCount} />
                <SeoScoreCard
                  label="Frase média"
                  value={liveMetrics.avgSentenceLength}
                  sub="palavras"
                />
              </div>
            ) : null}

            {issues.length > 0 ? (
              <ul className="mt-3 space-y-1 rounded-lg border border-brand/25 bg-brand/10 p-3 text-xs text-brand-bright/90">
                {issues.map((issue) => (
                  <li key={issue}>• {issue}</li>
                ))}
              </ul>
            ) : null}

            <button
              type="button"
              disabled={loading}
              onClick={() => void runOptimize()}
              className="mt-4 w-full rounded-xl border border-brand/45 bg-brand/35 py-3 text-sm font-bold text-white transition hover:bg-brand/50 disabled:opacity-50"
            >
              {loading ? "Otimizando com IA…" : "Otimizar para SEO"}
            </button>
          </SeoPanel>

          <SeoPanel delay={80} className="flex flex-col">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold text-white">Texto otimizado pela IA</h2>
                <p className="mt-1 text-xs text-white/45">
                  {result?.aiPowered ? "OpenAI · editorial SEO" : "Modo local · aguardando API key"}
                </p>
              </div>
              {result ? (
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={copyOptimized}
                    className="rounded-lg border border-white/12 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
                  >
                    Copiar
                  </button>
                  <button
                    type="button"
                    onClick={downloadMarkdown}
                    className="rounded-lg border border-white/12 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
                  >
                    MD
                  </button>
                  <button
                    type="button"
                    onClick={downloadHtml}
                    className="rounded-lg border border-white/12 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
                  >
                    HTML
                  </button>
                  <button
                    type="button"
                    onClick={undoToOriginal}
                    className="rounded-lg border border-white/12 px-2 py-1 text-xs text-white/70 hover:bg-white/5"
                  >
                    Desfazer
                  </button>
                </div>
              ) : null}
            </div>

            <AnimatePresence mode="wait">
              {result ? (
                <motion.pre
                  key="out"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 max-h-[420px] flex-1 overflow-auto whitespace-pre-wrap rounded-xl border border-brand/20 bg-brand/5 p-4 font-mono text-sm leading-relaxed text-white/90"
                >
                  {result.optimizedText}
                </motion.pre>
              ) : (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 flex flex-1 items-center justify-center text-center text-sm text-white/40"
                >
                  {showDemo
                    ? "Clique em Otimizar para ver a versão melhorada."
                    : "O resultado aparecerá aqui após a otimização."}
                </motion.p>
              )}
            </AnimatePresence>

            {result && liveMetrics ? (
              <div className="mt-4 space-y-2">
                <ReadabilityGauge label="Legibilidade" level={result.metricsAfter.readability} />
                <ReadabilityGauge
                  label="Escaneabilidade"
                  level={result.metricsAfter.scannability}
                />
              </div>
            ) : null}
          </SeoPanel>
        </div>

        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 space-y-10"
          >
            <section>
              <h2 className="text-xl font-bold">Antes vs depois</h2>
              <div className="mt-4 grid gap-6 lg:grid-cols-2">
                <MetricsComparisonTable
                  before={result.metricsBefore}
                  after={result.metricsAfter}
                />
                <SeoPanel>
                  <p className="mb-3 text-sm font-semibold text-white/70">Qualidade do conteúdo</p>
                  <ContentQualityRadar
                    before={result.metricsBefore}
                    after={result.metricsAfter}
                  />
                </SeoPanel>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold">O que foi otimizado</h2>
              <div className="mt-4">
                <OptimizationChangesPanel changes={result.changes} />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold">Comparador visual</h2>
              <p className="mt-1 text-sm text-white/45">
                Verde = adicionado · Vermelho = removido
              </p>
              <div className="mt-4">
                <DiffViewer
                  original={text}
                  optimized={result.optimizedText}
                  notes={result.diffNotes}
                />
              </div>
            </section>

            {result.faqs.length > 0 ? (
              <section>
                <h2 className="text-xl font-bold">FAQs sugeridas</h2>
                <ul className="mt-3 list-inside list-disc text-sm text-white/60">
                  {result.faqs.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </motion.div>
        ) : null}

        {history.length > 0 ? (
          <section className="mt-12">
            <h2 className="text-lg font-semibold text-white/80">Histórico de versões</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {history.map((h) => (
                <li key={h.id}>
                  <button
                    type="button"
                    onClick={() => restoreVersion(h)}
                    className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-left text-sm text-white/60 transition hover:border-brand/30"
                  >
                    {h.preview}… · {new Date(h.createdAt).toLocaleString("pt-BR")}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </section>
    </>
  );
}
