"use client";

import { useState } from "react";

import { ComparativeAnalysisHistoryPanel } from "~/app/_components/seo/comparative-analysis-history-panel";
import { DomainInputForm } from "~/app/_components/seo/domain-input-form";
import { SeoPanel } from "~/app/_components/seo/seo-panel";

/**
 * Página do analisador com formulário e histórico de análises.
 */
export function AnalyzerPageClient() {
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

  return (
    <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
      <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Análise comparativa</h1>
      <p className="mt-2 text-sm text-white/55">
        Artigo-alvo + concorrentes opcionais na SERP.{" "}
        <span className="text-white/40">
          Entre com Google para incluir cliques, impressões e posição real do Search Console no
          relatório.
        </span>
      </p>

      <SeoPanel className="mt-8">
        <DomainInputForm onAnalysisComplete={() => setHistoryRefreshKey((k) => k + 1)} />
      </SeoPanel>

      <div className="mt-8">
        <ComparativeAnalysisHistoryPanel refreshKey={historyRefreshKey} />
      </div>
    </div>
  );
}
