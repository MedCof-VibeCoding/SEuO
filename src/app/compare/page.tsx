import { type Metadata } from "next";

import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";

import { CompareView } from "./compare-view";

export const metadata: Metadata = {
  title: "Comparar SEO | SEuO",
  description: "Dashboard comparativo entre seu site e concorrentes.",
};

export default function ComparePage() {
  return (
    <SeoPlatformLayout>
      <CompareView />
    </SeoPlatformLayout>
  );
}
