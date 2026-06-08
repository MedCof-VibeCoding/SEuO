import Link from "next/link";

import { SeoPanel } from "./seo-panel";

const TOOLS = [
  {
    title: "Análise Comparativa",
    description1:
      "Compare seu artigo com até dois concorrentes na SERP. A IA analisa palavras-chave, conteúdo on-page e monta um plano de ação objetivo.",
    description2:
      "Ideal para entender gaps semânticos, oportunidades de otimização e quick wins antes de publicar ou atualizar um texto.",
    href: "/analyzer",
    cta: "Abrir análise comparativa",
  },
  {
    title: "Google Position Checker",
    description1:
      "Informe a URL e a palavra-chave para consultar posição orgânica, impressões e termos relacionados via Google Search Console.",
    description2:
      "Acompanhe ranking, snippet na SERP, score da página e evolução estimada para priorizar o que ranquear melhor.",
    href: "/google-position-checker",
    cta: "Abrir Position Checker",
  },
] as const;

/**
 * Cards das ferramentas na home.
 */
export function HomeToolsSection() {
  return (
    <section aria-labelledby="home-tools-heading" className="mt-4">
      <h2 id="home-tools-heading" className="sr-only">
        Ferramentas disponíveis
      </h2>
      <div className="grid gap-6 lg:grid-cols-2">
        {TOOLS.map((tool, i) => (
          <SeoPanel key={tool.title} delay={i * 80} className="flex h-full flex-col">
            <h3 className="text-xl font-bold text-white">{tool.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-white/65">{tool.description1}</p>
            <p className="mt-3 text-sm leading-relaxed text-white/50">{tool.description2}</p>
            <div className="mt-6 flex flex-1 items-end">
              <Link
                href={tool.href}
                className="inline-flex rounded-xl border border-brand/45 bg-brand/25 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand/35"
              >
                {tool.cta} →
              </Link>
            </div>
          </SeoPanel>
        ))}
      </div>
    </section>
  );
}
