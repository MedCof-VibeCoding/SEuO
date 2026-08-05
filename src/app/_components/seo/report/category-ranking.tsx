import { CATEGORY_LABELS } from "~/features/seo/services/comparison-engine";
import type {
  ComparisonWinner,
  DomainAnalysis,
  SeoCategory,
} from "~/features/seo/types/analysis";

type CategoryRankingProps = {
  domains: DomainAnalysis[];
  winners: ComparisonWinner[];
  categories: SeoCategory[];
};

/**
 * Comparativo por categoria em barras, mais legível que a tabela em telas pequenas.
 */
export function CategoryRanking({ domains, winners, categories }: CategoryRankingProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {categories.map((category) => {
        const winner = winners.find((item) => item.category === category);
        return (
          <div key={category}>
            <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
              <h4 className="text-sm font-semibold text-white/85">
                {CATEGORY_LABELS[category]}
              </h4>
              {winner ? (
                <p className="text-xs text-white/40">
                  Líder: <span className="text-white/70">{winner.domain}</span>
                  {winner.marginPercent !== 0 ? (
                    <span className="ml-1 text-emerald-300">
                      {winner.marginPercent > 0 ? "+" : ""}
                      {winner.marginPercent}%
                    </span>
                  ) : null}
                </p>
              ) : null}
            </div>

            <ul className="space-y-2">
              {domains.map((domain) => {
                const score = domain.categoryScores[category];
                const isWinner = winner?.domain === domain.domain;
                const isPrimary = domain.role === "primary";
                return (
                  <li key={domain.domain} className="flex items-center gap-3">
                    <span
                      className={[
                        "w-28 shrink-0 truncate text-xs sm:w-32",
                        isPrimary ? "font-semibold text-white/85" : "text-white/45",
                      ].join(" ")}
                      title={domain.domain}
                    >
                      {domain.domain}
                    </span>
                    <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                      <div
                        className={[
                          "h-full rounded-full transition-all duration-700",
                          isWinner ? "bg-emerald-400" : isPrimary ? "bg-brand" : "bg-white/25",
                        ].join(" ")}
                        style={{ width: `${Math.max(2, score)}%` }}
                      />
                    </div>
                    <span
                      className={[
                        "w-7 shrink-0 text-right text-xs tabular-nums",
                        isWinner ? "font-semibold text-emerald-300" : "text-white/45",
                      ].join(" ")}
                    >
                      {score}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        );
      })}
    </div>
  );
}
