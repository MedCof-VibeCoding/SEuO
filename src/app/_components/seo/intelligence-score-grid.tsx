import type { IntelligenceScores } from "~/features/seo/types/analysis";

const LABELS: { key: keyof IntelligenceScores; label: string; hint: string }[] = [
  { key: "seo", label: "SEO Score", hint: "Visibilidade orgânica geral" },
  { key: "content", label: "Score de Conteúdo", hint: "Profundidade e clareza do texto" },
  { key: "technical", label: "Score Técnico", hint: "Base técnica para indexação" },
  { key: "conversion", label: "Score de Conversão", hint: "Facilidade de leitura e CTAs" },
  { key: "authority", label: "Score de Autoridade", hint: "Confiança e referências" },
];

type IntelligenceScoreGridProps = {
  scores: IntelligenceScores;
  hideKeys?: Array<keyof IntelligenceScores>;
};

/**
 * Grid de scores explicados visualmente.
 */
export function IntelligenceScoreGrid({ scores, hideKeys = [] }: IntelligenceScoreGridProps) {
  const visible = LABELS.filter((item) => !hideKeys.includes(item.key));

  return (
    <div
      className={[
        "grid gap-3 sm:grid-cols-2",
        visible.length >= 5 ? "lg:grid-cols-5" : "lg:grid-cols-4",
      ].join(" ")}
    >
      {visible.map(({ key, label, hint }) => {
        const value = scores[key];
        const color =
          value >= 75
            ? "text-brand-bright"
            : value >= 50
              ? "text-seo-accent-bright"
              : "text-white/70";
        return (
          <div
            key={key}
            className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
            title={hint}
          >
            <p className="text-xs text-white/45">{label}</p>
            <p className={`mt-1 text-2xl font-bold tabular-nums ${color}`}>{value}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-brand transition-all duration-700"
                style={{ width: `${value}%` }}
              />
            </div>
            <p className="mt-2 text-[10px] text-white/35">{hint}</p>
          </div>
        );
      })}
    </div>
  );
}

