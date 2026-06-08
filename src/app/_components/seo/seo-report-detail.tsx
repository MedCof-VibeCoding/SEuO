"use client";

import Link from "next/link";

import { CATEGORY_LABELS } from "~/features/seo/services/comparison-engine";
import type { SeoAnalysisReport, SeoCategory } from "~/features/seo/types/analysis";

import { SeoPanel } from "./seo-panel";

type SeoReportDetailProps = {
  report: SeoAnalysisReport;
};

const CATEGORIES = Object.keys(CATEGORY_LABELS) as SeoCategory[];

/**
 * Relatório detalhado por domínio e categoria.
 */
export function SeoReportDetail({ report }: SeoReportDetailProps) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 pb-20 sm:px-6">
      <div className="no-print mb-8">
        <Link
          href={`/compare?id=${report.id}`}
          className="text-sm text-white/50 transition hover:text-white"
        >
          ← Voltar ao dashboard
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Relatório detalhado</h1>
        <p className="text-sm text-white/50">{report.primaryDomain}</p>
      </div>

      {report.domains.map((domain, di) => (
        <div key={domain.domain} className="mb-10">
          <h2 className="mb-4 text-lg font-semibold text-seo-accent-bright">
            {domain.domain}{" "}
            <span className="text-sm font-normal text-white/45">
              — Score {domain.overallScore}/100
            </span>
          </h2>
          {CATEGORIES.map((cat, ci) => {
            const metrics = domain.metrics.filter((m) => m.category === cat);
            if (metrics.length === 0) return null;
            return (
              <SeoPanel key={cat} delay={(di * 5 + ci) * 40} className="mb-4">
                <h3 className="mb-3 text-sm font-semibold text-white/75">
                  {CATEGORY_LABELS[cat]} · {domain.categoryScores[cat]}/100
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[400px] text-sm">
                    <thead>
                      <tr className="text-left text-xs text-white/40">
                        <th className="pb-2 pr-4">Métrica</th>
                        <th className="pb-2 pr-4">Valor</th>
                        <th className="pb-2 pr-4">Score</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m) => (
                        <tr key={m.id} className="border-t border-white/[0.04]">
                          <td className="py-2.5 pr-4 text-white/70">{m.label}</td>
                          <td className="py-2.5 pr-4 font-mono text-white/55">
                            {m.displayValue}
                          </td>
                          <td className="py-2.5 pr-4 tabular-nums">{m.score}</td>
                          <td className="py-2.5">
                            <StatusBadge status={m.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </SeoPanel>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status }: { status: "pass" | "warn" | "fail" }) {
  const styles = {
    pass: "bg-emerald-500/15 text-emerald-300",
    warn: "bg-amber-500/15 text-amber-300",
    fail: "bg-brand/20 text-brand-bright",
  };
  const labels = { pass: "OK", warn: "Atenção", fail: "Crítico" };
  return (
    <span
      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold uppercase ${styles[status]}`}
    >
      {labels[status]}
    </span>
  );
}
