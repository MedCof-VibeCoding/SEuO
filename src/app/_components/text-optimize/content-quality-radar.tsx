"use client";

import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
} from "recharts";

import type { TextMetrics } from "~/features/text-optimize/types";

type ContentQualityRadarProps = {
  before: TextMetrics;
  after: TextMetrics;
};

function toRadar(metrics: TextMetrics) {
  const read =
    metrics.readability === "Alta" ? 90 : metrics.readability === "Média" ? 60 : 35;
  const scan =
    metrics.scannability === "Alta" ? 88 : metrics.scannability === "Média" ? 58 : 32;
  return [
    { axis: "SEO", value: metrics.seoScore },
    { axis: "Legibilidade", value: read },
    { axis: "CTR", value: Math.min(100, metrics.ctrEstimate * 12) },
    { axis: "Keywords", value: metrics.keywordCoverage },
    { axis: "Scan", value: scan },
  ];
}

/**
 * Radar comparativo de qualidade do conteúdo.
 */
export function ContentQualityRadar({ before, after }: ContentQualityRadarProps) {
  const data = toRadar(before).map((row, i) => ({
    axis: row.axis,
    antes: row.value,
    depois: toRadar(after)[i]?.value ?? row.value,
  }));

  return (
    <div className="h-[260px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="axis"
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }}
          />
          <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Antes"
            dataKey="antes"
            stroke="#64748b"
            fill="#64748b"
            fillOpacity={0.12}
          />
          <Radar
            name="Depois"
            dataKey="depois"
            stroke="var(--color-brand-bright)"
            fill="var(--color-brand-bright)"
            fillOpacity={0.2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
