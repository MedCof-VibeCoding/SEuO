import type { OptimizationChange } from "~/features/text-optimize/types";

const CATEGORY_LABEL: Record<OptimizationChange["category"], string> = {
  legibilidade: "Legibilidade",
  seo: "SEO",
  ctr: "CTR",
  estrutura: "Estrutura",
  conversao: "Conversão",
  autoridade: "Autoridade",
};

type OptimizationChangesPanelProps = {
  changes: OptimizationChange[];
};

/**
 * Lista explicativa do que foi otimizado.
 */
export function OptimizationChangesPanel({ changes }: OptimizationChangesPanelProps) {
  if (changes.length === 0) {
    return (
      <p className="text-sm text-white/50">Nenhuma alteração estrutural registrada.</p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {changes.map((c, i) => (
        <li
          key={`${c.category}-${c.title}-${i}`}
          className="rounded-xl border border-sidebar-border bg-sidebar/50 p-4"
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-brand-bright">
            {CATEGORY_LABEL[c.category]}
          </p>
          <p className="mt-1 font-semibold text-white/90">{c.title}</p>
          <p className="mt-2 text-sm leading-relaxed text-white/55">{c.description}</p>
        </li>
      ))}
    </ul>
  );
}
