import { type Metadata } from "next";

import { SeoPlatformLayout } from "~/app/_components/seo/seo-platform-layout";

import { ReportView } from "./report-view";

export const metadata: Metadata = {
  title: "Relatório SEO | SEuO",
  description: "Análise detalhada por categoria e métrica.",
};

type PageProps = { params: Promise<{ slug: string }> };

export default async function ReportPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <SeoPlatformLayout>
      <ReportView slug={slug} />
    </SeoPlatformLayout>
  );
}
