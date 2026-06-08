"use client";

import Link from "next/link";
import { Suspense } from "react";

import { DashboardSkeleton } from "~/app/_components/seo/dashboard-skeleton";
import { SeoReportDetail } from "~/app/_components/seo/seo-report-detail";
import { useSeoReport } from "~/features/seo/hooks/use-seo-report";

function ReportContent({ slug }: { slug: string }) {
  const { report, loading, error } = useSeoReport(slug);

  if (loading) return <DashboardSkeleton />;
  if (error || !report) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-white/60">Relatório não encontrado.</p>
        <Link
          href="/analyzer"
          className="mt-4 inline-block text-seo-accent-bright hover:underline"
        >
          Nova análise
        </Link>
      </div>
    );
  }

  return <SeoReportDetail report={report} />;
}

/**
 * Relatório detalhado por slug (id ou shareSlug).
 */
export function ReportView({ slug }: { slug: string }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <ReportContent slug={slug} />
    </Suspense>
  );
}
