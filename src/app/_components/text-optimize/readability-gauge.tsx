type ReadabilityGaugeProps = {
  label: string;
  level: "Baixa" | "Média" | "Alta";
};

const PCT = { Baixa: 35, Média: 62, Alta: 88 } as const;

/**
 * Barra de legibilidade / escaneabilidade.
 */
export function ReadabilityGauge({ label, level }: ReadabilityGaugeProps) {
  const pct = PCT[level];
  return (
    <div>
      <div className="flex justify-between text-xs">
        <span className="text-white/50">{label}</span>
        <span className="font-medium text-white/80">{level}</span>
      </div>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-brand transition-all duration-700"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
