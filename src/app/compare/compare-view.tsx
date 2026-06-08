"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

import { DashboardSkeleton } from "~/app/_components/seo/dashboard-skeleton";
import { SeoDashboard } from "~/app/_components/seo/seo-dashboard";
import { useSeoReport } from "~/features/seo/hooks/use-seo-report";

function CompareContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const { report, loading, error } = useSeoReport(id);

  useEffect(() => {
    if (report) {
      console.log(JSON.stringify(report, null, 2));
    }
  }, [report]);

  if (!id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <p className="text-white/60">Nenhuma análise selecionada.</p>
        <Link
          href="/analyzer"
          className="mt-4 inline-block text-seo-accent-bright hover:underline"
        >
          Iniciar nova análise
        </Link>
      </div>
    );
  }

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

  return <SeoDashboard report={report} />;
}

/**
 * Dashboard comparativo (query: ?id=).
 */
export function CompareView() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <CompareContent />
    </Suspense>
  );
}
