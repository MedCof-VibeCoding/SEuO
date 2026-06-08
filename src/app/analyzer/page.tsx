import { type Metadata } from "next";

import { DomainInputForm } from "~/app/_components/seo/domain-input-form";
import { SeoPanel } from "~/app/_components/seo/seo-panel";
import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";

export const metadata: Metadata = {
  title: "Análise comparativa editorial | SEuO SEO",
  description:
    "Compare artigo-alvo com concorrentes na SERP. Coleta on-page, pontuação MedCof e plano de ação via Gemini.",
};

/**
 * Página do analisador — URLs de artigos na SERP.
 */
export default function AnalyzerPage() {
  return (
    <SeoPlatformLayout>
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6 sm:py-16">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Análise comparativa</h1>
        <p className="mt-2 text-sm text-white/55">
          Artigo-alvo + até 2 concorrentes na SERP.
        </p>
        <SeoPanel className="mt-8">
          <DomainInputForm />
        </SeoPanel>
      </div>
    </SeoPlatformLayout>
  );
}
