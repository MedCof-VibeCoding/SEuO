import Link from "next/link";

import { SeoPanel } from "~/app/_components/seo/seo-panel";
import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";
import { PLAN_LIMITS } from "~/features/seo/constants/plans";

/**
 * Configurações da plataforma (acesso público).
 */
export default function SettingsPage() {
  const limits = PLAN_LIMITS.pro;

  return (
    <SeoPlatformLayout>
      <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="mt-2 text-sm text-white/55">
          Plataforma em modo aberto — todos os recursos disponíveis sem conta.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <SeoPanel>
            <h2 className="font-semibold text-white">Recursos ativos</h2>
            <ul className="mt-3 space-y-2 text-sm text-white/60">
              <li>Análises: ilimitadas</li>
              <li>Insights completos: {limits.fullInsights ? "Sim" : "Não"}</li>
              <li>Export PDF: {limits.exportPdf ? "Sim" : "Não"}</li>
            </ul>
          </SeoPanel>

          <SeoPanel delay={80}>
            <h2 className="font-semibold text-white">Integrações</h2>
            <ul className="mt-2 list-inside list-disc text-sm text-white/50">
              <li>Google Gemini — análise comparativa (`GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.5-flash`)</li>
              <li>OpenAI — opcional (`OPENAI_API_KEY`)</li>
              <li>MongoDB — persistência opcional de relatórios</li>
              <li>Lighthouse / PageSpeed — rotas mock</li>
            </ul>
          </SeoPanel>
        </div>
      </div>
    </SeoPlatformLayout>
  );
}
