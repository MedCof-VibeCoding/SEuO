import { type Metadata } from "next";

import { BriefingPageClient } from "./_components/briefing-page-client";

export const metadata: Metadata = {
  title: "Briefing GEO + SEO | Produção de conteúdo",
  description:
    "Briefing editorial completo para redatores: SEO, GEO, estrutura, diretrizes e otimização para IA generativa.",
};

/**
 * Briefing de produção de conteúdo GEO + SEO.
 */
export default function BriefingPage() {
  return <BriefingPageClient />;
}
