import { type Metadata } from "next";

import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";

import { GooglePositionCheckerClient } from "./google-position-checker-client";

export const metadata: Metadata = {
  title: "Google Position Checker | Posição no Google",
  description:
    "Verifique posição, impressões e palavras-chave da sua URL com dados do Google Search Console.",
};

/**
 * Landing Google Position Checker — consulta por URL (keyword opcional).
 */
export default function GooglePositionCheckerPage() {
  return (
    <SeoPlatformLayout>
      <GooglePositionCheckerClient />
    </SeoPlatformLayout>
  );
}
