import { type Metadata } from "next";

import { HomeToolsSection } from "~/app/_components/seo/home-tools-section";
import { SeuoLogo } from "~/app/_components/seo/seuo-logo";
import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";

const siteDescription =
  "Ferramentas SEO da SEuO: análise comparativa editorial com IA e Google Position Checker com dados do Search Console.";

export const metadata: Metadata = {
  title: "SEuO SEO — Ferramentas de análise e posicionamento",
  description: siteDescription,
  keywords: [
    "análise SEO",
    "comparar SEO",
    "Google Position Checker",
    "Search Console",
    "auditoria SEO",
  ],
  openGraph: {
    title: "SEuO SEO — Ferramentas",
    description: siteDescription,
    type: "website",
    locale: "pt_BR",
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

/**
 * Home — apresentação das ferramentas disponíveis.
 */
export default function HomePage() {
  return (
    <SeoPlatformLayout>
      <div className="mx-auto max-w-6xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16">
        <header className="max-w-3xl">
          <SeuoLogo variant="full" className="mb-2 h-16 w-16" />
          <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Ferramentas para{" "}
            <span className="text-brand-bright">crescer no orgânico</span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/55">
            Compare conteúdos com concorrentes e monitore posições no Google em um só lugar.
            Escolha a ferramenta abaixo para começar.
          </p>
        </header>

        <HomeToolsSection />
      </div>
    </SeoPlatformLayout>
  );
}
