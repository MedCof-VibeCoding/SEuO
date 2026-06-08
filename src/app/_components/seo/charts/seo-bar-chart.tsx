"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { DomainAnalysis } from "~/features/seo/types/analysis";

type SeoBarChartProps = {
  domains: DomainAnalysis[];
};

/**
 * Barras de score geral por domínio.
 */
export function SeoBarChart({ domains }: SeoBarChartProps) {
  const data = domains.map((d) => ({
    name: d.domain.length > 14 ? `${d.domain.slice(0, 12)}…` : d.domain,
    fullName: d.domain,
    score: d.overallScore,
    fill: d.role === "primary" ? "var(--color-brand-bright)" : "#64748b",
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-sidebar)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 12,
              fontSize: 12,
            }}
            labelFormatter={(_, payload) =>
              (payload?.[0]?.payload as { fullName?: string })?.fullName ?? ""
            }
            formatter={(value) => [`${value ?? 0}/100`, "Score SEO"]}
          />
          <Bar dataKey="score" radius={[8, 8, 0, 0]} maxBarSize={48} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
