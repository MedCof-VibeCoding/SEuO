import type { KeywordGap } from "~/features/seo/types/analysis";

type KeywordGapTableProps = {
  gaps: KeywordGap[];
};

/**
 * Tabela de gaps de palavras-chave vs. concorrentes.
 */
export function KeywordGapTable({ gaps }: KeywordGapTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] text-left text-sm">
        <thead>
          <tr className="border-b border-white/10 text-xs uppercase text-white/40">
            <th className="pb-3 pr-4">Palavra-chave</th>
            <th className="pb-3 pr-4">Concorrentes</th>
            <th className="pb-3 pr-4">Intenção</th>
            <th className="pb-3">Oportunidade</th>
          </tr>
        </thead>
        <tbody>
          {gaps.map((g) => (
            <tr key={g.keyword} className="border-b border-white/[0.04]">
              <td className="py-3 pr-4 font-medium text-white/80">{g.keyword}</td>
              <td className="py-3 pr-4 text-white/55">
                {g.usedByCompetitors ? "Sim" : "Não"}
              </td>
              <td className="py-3 pr-4 text-white/55">{g.searchIntent}</td>
              <td className="py-3">
                <OpportunityBadge level={g.opportunity} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OpportunityBadge({ level }: { level: "high" | "medium" | "low" }) {
  const styles = {
    high: "bg-emerald-500/15 text-emerald-300",
    medium: "bg-amber-500/15 text-amber-300",
    low: "bg-white/10 text-white/50",
  };
  return (
    <span className={`rounded px-2 py-0.5 text-xs font-semibold ${styles[level]}`}>
      {level}
    </span>
  );
}
