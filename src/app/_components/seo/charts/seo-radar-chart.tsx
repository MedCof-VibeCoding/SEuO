"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Legend,
} from "recharts";

import { CATEGORY_LABELS } from "~/features/seo/services/comparison-engine";
import type { DomainAnalysis, SeoCategory } from "~/features/seo/types/analysis";

const CATEGORIES = Object.keys(CATEGORY_LABELS) as SeoCategory[];

type SeoRadarChartProps = {
  domains: DomainAnalysis[];
  categories?: SeoCategory[];
};

const COLORS = ["#ff4d62", "#e2263c", "#94a3b8"];

/**
 * Gráfico radar comparativo por categoria.
 */
export function SeoRadarChart({ domains, categories = CATEGORIES }: SeoRadarChartProps) {
  const data = categories.map((cat) => {
    const row: Record<string, string | number> = {
      category: CATEGORY_LABELS[cat],
    };
    domains.forEach((d) => {
      row[d.domain] = d.categoryScores[cat];
    });
    return row;
  });

  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 8, right: 24, bottom: 8, left: 24 }}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          {domains.map((d, i) => (
            <Radar
              key={d.domain}
              name={d.domain}
              dataKey={d.domain}
              stroke={COLORS[i % COLORS.length]}
              fill={COLORS[i % COLORS.length]}
              fillOpacity={0.15}
              strokeWidth={2}
            />
          ))}
          <Legend
            wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.65)" }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
