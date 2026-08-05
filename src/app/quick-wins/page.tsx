import type { Metadata } from "next";

import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";

import { QuickWinsPageClient } from "./quick-wins-page-client";

export const metadata: Metadata = {
  title: "QuickWin — Pauta SEO | MedCof / SearchHub",
  description:
    "Gere a pauta editorial QuickWin no padrão MedCof/SearchHub: snippet, estrutura H2/H3, termos secundários e linkagem interna.",
};

/**
 * Página da ferramenta de geração de Quick Wins.
 */
export default function QuickWinsPage() {
  return (
    <SeoPlatformLayout>
      <QuickWinsPageClient />
    </SeoPlatformLayout>
  );
}
