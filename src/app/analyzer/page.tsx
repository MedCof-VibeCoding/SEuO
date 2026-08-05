import { type Metadata } from "next";

import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";

import { AnalyzerPageClient } from "./_components/analyzer-page-client";

export const metadata: Metadata = {
  title: "Análise comparativa editorial | SEuO SEO",
  description:
    "Compare artigo-alvo com concorrentes na SERP. Coleta on-page, pontuação MedCof e plano de ação via OpenAI.",
};

/**
 * Página do analisador — URLs de artigos na SERP.
 */
export default function AnalyzerPage() {
  return (
    <SeoPlatformLayout>
      <AnalyzerPageClient />
    </SeoPlatformLayout>
  );
}
