import { type Metadata } from "next";

import { OptimizePageClient } from "~/app/_components/text-optimize/optimize-page-client";
import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";

export const metadata: Metadata = {
  title: "Otimização de texto SEO com IA",
  description:
    "Copiloto SEO para copywriting: melhore rankings e legibilidade preservando significado e intenção originais.",
};

/**
 * Página premium de otimização de texto com IA.
 */
export default function OptimizeTextPage() {
  return (
    <SeoPlatformLayout>
      <OptimizePageClient />
    </SeoPlatformLayout>
  );
}
