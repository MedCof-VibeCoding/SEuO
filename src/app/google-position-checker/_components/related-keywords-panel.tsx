"use client";

import { motion } from "framer-motion";
import { KeyRound, Sparkles } from "lucide-react";

import { RankBadge } from "~/app/google-position-checker/_components/rank-badge";
import type { RelatedRankingKeyword } from "~/features/seo/types/google-position-check";

type RelatedKeywordsPanelProps = {
  keywords: RelatedRankingKeyword[];
  primaryKeyword: string;
};

/**
 * Lista keywords associadas ao conteúdo da URL com posição estimada no Google.
 */
export function RelatedKeywordsPanel({
  keywords,
  primaryKeyword,
}: RelatedKeywordsPanelProps) {
  const ranked = keywords.filter((k) => k.position !== null);
  const notRanked = keywords.filter((k) => k.position === null);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
      className="rounded-2xl border border-white/10 bg-black/25 p-5"
      aria-labelledby="related-keywords-heading"
    >
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3
            id="related-keywords-heading"
            className="flex items-center gap-2 text-sm font-semibold text-white/85"
          >
            <KeyRound className="h-4 w-4 text-brand-bright" aria-hidden />
            Palavras-chave associadas ao conteúdo
          </h3>
          <p className="mt-1 max-w-xl text-xs leading-relaxed text-white/45">
            Termos semânticos ligados ao texto desta URL que também aparecem no ranking do Google
            (além de &quot;{primaryKeyword}&quot;).
          </p>
        </div>
        <div className="flex gap-2 text-xs">
          <span className="rounded-lg border border-brand/25 bg-brand/10 px-2.5 py-1 text-brand-bright">
            {ranked.length} ranqueando
          </span>
          {notRanked.length > 0 ? (
            <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-white/45">
              {notRanked.length} sem posição
            </span>
          ) : null}
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/8">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/8 bg-white/[0.03] text-[10px] font-semibold uppercase tracking-wider text-white/40">
              <th className="px-4 py-3">Palavra-chave</th>
              <th className="px-4 py-3">Posição</th>
              <th className="hidden px-4 py-3 sm:table-cell">Impressões</th>
              <th className="hidden px-4 py-3 sm:table-cell">Cliques</th>
              <th className="hidden px-4 py-3 md:table-cell">Relevância</th>
              <th className="px-4 py-3">Faixa</th>
            </tr>
          </thead>
          <tbody>
            {keywords.map((row, i) => (
              <tr
                key={row.keyword}
                className={
                  row.isPrimary
                    ? "border-b border-brand/15 bg-brand/8"
                    : i % 2 === 0
                      ? "border-b border-white/5 bg-white/[0.02]"
                      : "border-b border-white/5"
                }
              >
                <td className="px-4 py-3">
                  <span className="font-medium text-white/90">{row.keyword}</span>
                  {row.isPrimary ? (
                    <span className="ml-2 inline-flex items-center gap-0.5 rounded bg-brand/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-brand-bright">
                      <Sparkles className="h-2.5 w-2.5" aria-hidden />
                      consultada
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 tabular-nums font-bold text-white">
                  {row.position !== null ? (
                    <span className="text-brand-bright">#{row.position}</span>
                  ) : (
                    <span className="text-sm font-normal text-white/35">—</span>
                  )}
                </td>
                <td className="hidden px-4 py-3 text-white/55 sm:table-cell">
                  {row.searchVolumeLabel}
                </td>
                <td className="hidden px-4 py-3 tabular-nums text-white/55 sm:table-cell">
                  {row.clicksLabel}
                </td>
                <td className="hidden px-4 py-3 md:table-cell">
                  <RelevanceBar score={row.relevanceScore} />
                </td>
                <td className="px-4 py-3">
                  <RankBadge tier={row.rankTier} className="scale-90 origin-left" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-[10px] text-white/35">
        Queries com impressões e cliques nesta URL — Google Search Console (últimos 28 dias).
      </p>
    </motion.section>
  );
}

function RelevanceBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand to-brand-bright"
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="text-xs tabular-nums text-white/50">{score}%</span>
    </div>
  );
}
