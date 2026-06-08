"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { RankingHistoryPoint } from "~/features/seo/types/google-position-check";

type RankingChartProps = {
  data: RankingHistoryPoint[];
};

/**
 * Gráfico de evolução de posição (menor = melhor no eixo Y invertido).
 */
export function RankingChart({ data }: RankingChartProps) {
  const chartData = data.map((p) => ({
    label: new Date(p.date).toLocaleDateString("pt-BR", { month: "short" }),
    position: p.position ?? 100,
    display: p.position ?? "—",
  }));

  return (
    <div className="h-52 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
          <XAxis
            dataKey="label"
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            reversed
            domain={[1, 50]}
            tick={{ fill: "rgba(255,255,255,0.45)", fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              background: "#0c1218",
              border: "1px solid rgba(226, 38, 60, 0.35)",
              borderRadius: 12,
              fontSize: 12,
            }}
            formatter={(value) => [`#${String(value ?? "—")}`, "Posição"]}
            labelStyle={{ color: "rgba(255,255,255,0.6)" }}
          />
          <Line
            type="monotone"
            dataKey="position"
            stroke="var(--color-brand-bright)"
            strokeWidth={2}
            dot={{ fill: "var(--color-brand)", r: 3 }}
            activeDot={{ r: 5, fill: "var(--color-brand-bright)" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
