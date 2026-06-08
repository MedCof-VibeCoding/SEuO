import type { CompetitorAdvantage } from "~/features/seo/types/analysis";

type CompetitorAdvantagePanelProps = {
  items: CompetitorAdvantage[];
  narrative?: string;
};

/**
 * Texto enxuto sobre por que concorrentes performam melhor em SEO.
 */
export function CompetitorAdvantagePanel({ items, narrative }: CompetitorAdvantagePanelProps) {
  if (narrative) {
    return (
      <p className="text-sm leading-relaxed text-white/70">{narrative}</p>
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-white/50">Adicione concorrentes para análise comparativa.</p>
    );
  }

  const isSummary =
    items.length === 1 && items[0]?.domain === "Resumo" && !items[0]?.opportunity;

  if (isSummary && items[0]) {
    return (
      <p className="text-sm leading-relaxed text-white/70">{items[0].explanation}</p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {items.map((item) => (
        <li
          key={item.domain}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4"
        >
          <p className="text-xs font-bold text-seo-accent-bright">{item.domain}</p>
          <p className="mt-1 font-semibold text-white">{item.pattern}</p>
          <p className="mt-2 text-sm text-white/60">{item.explanation}</p>
          {item.opportunity ? (
            <p className="mt-2 text-sm text-brand-bright/90">
              Oportunidade: {item.opportunity}
            </p>
          ) : null}
        </li>
      ))}
    </ul>
  );
}
