import type { TextMetrics } from "~/features/text-optimize/types";

type MetricsComparisonTableProps = {
  before: TextMetrics;
  after: TextMetrics;
};

const ROWS: {
  key: keyof Pick<
    TextMetrics,
    "seoScore" | "readability" | "ctrEstimate" | "keywordCoverage" | "scannability"
  >;
  label: string;
  format: (v: string | number) => string;
}[] = [
  { key: "seoScore", label: "SEO Score", format: (v) => String(v) },
  { key: "readability", label: "Legibilidade", format: (v) => String(v) },
  { key: "ctrEstimate", label: "CTR estimado", format: (v) => `${v}%` },
  { key: "keywordCoverage", label: "Keyword coverage", format: (v) => `${v}%` },
  { key: "scannability", label: "Escaneabilidade", format: (v) => String(v) },
];

/**
 * Tabela antes vs depois das métricas de otimização.
 */
export function MetricsComparisonTable({ before, after }: MetricsComparisonTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-sidebar-border">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 bg-black/25 text-xs uppercase tracking-wider text-white/45">
            <th className="px-4 py-3 font-semibold">Métrica</th>
            <th className="px-4 py-3 font-semibold">Antes</th>
            <th className="px-4 py-3 font-semibold">Depois</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const b = before[row.key];
            const a = after[row.key];
            const improved =
              row.key === "seoScore" || row.key === "keywordCoverage" || row.key === "ctrEstimate"
                ? Number(a) > Number(b)
                : a !== b;
            return (
              <tr key={row.key} className="border-b border-white/5 last:border-0">
                <td className="px-4 py-3 text-white/70">{row.label}</td>
                <td className="px-4 py-3 text-white/50">{row.format(b)}</td>
                <td
                  className={
                    improved
                      ? "px-4 py-3 font-semibold text-brand-bright"
                      : "px-4 py-3 text-white/80"
                  }
                >
                  {row.format(a)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
