"use client";

import { motion } from "framer-motion";

import type {
  SerpKeywordRanking,
  SerpPositionAnalysis,
  SerpResultType,
} from "~/features/seo/types/analysis";

const RESULT_LABEL: Record<SerpResultType, string> = {
  organic: "Orgânico",
  featured_snippet: "Featured Snippet",
  people_also_ask: "People Also Ask",
  ai_overview: "AI Overview",
  not_ranking: "Fora do top 50",
};

type GoogleSerpPositionPanelProps = {
  serp: SerpPositionAnalysis;
  primaryDomain: string;
};

/**
 * Painel de posicionamento no Google (SERP) no benchmark SEO.
 */
export function GoogleSerpPositionPanel({
  serp,
  primaryDomain,
}: GoogleSerpPositionPanelProps) {
  const mainKw =
    serp.trackedKeywords.find((k) => k.keyword === serp.mainKeyword) ??
    serp.trackedKeywords[0];

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Posição média"
          value={serp.averagePosition !== null ? `#${serp.averagePosition}` : "—"}
          sub="palavras monitoradas"
        />
        <MetricCard
          label="Visibilidade SERP"
          value={`${serp.visibilityScore}%`}
          sub="score estimado"
          highlight
        />
        <MetricCard
          label="Top 10 Google"
          value={`${serp.keywordsInTop10}/${serp.keywordsTracked}`}
          sub="keywords ranqueadas"
        />
        <MetricCard
          label="Share top 10"
          value={`${serp.primaryDomainShare}%`}
          sub={primaryDomain}
        />
      </div>

      <p className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3 text-sm leading-relaxed text-white/70">
        {serp.insight}
      </p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            Simulação SERP — &quot;{serp.mainKeyword}&quot;
          </h3>
          <SerpVisualList
            keyword={mainKw}
            primaryDomain={primaryDomain}
            competitors={mainKw?.competitorPositions ?? []}
          />
          <p className="mt-2 text-[10px] text-white/35">
            Atualizado {new Date(serp.lastChecked).toLocaleString("pt-BR")} · dados
            estimados (integração Search Console em produção)
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white/80">
            Recursos na SERP
          </h3>
          <ul className="space-y-2">
            {serp.serpFeatures.map((f) => (
              <li
                key={f.feature}
                className="flex items-center justify-between rounded-lg border border-white/8 bg-black/20 px-3 py-2 text-sm"
              >
                <span className="text-white/75">{f.feature}</span>
                <span
                  className={
                    f.present ? "text-brand-bright" : "text-white/35"
                  }
                >
                  {f.present ? f.holderDomain ?? "Sim" : "Não"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="overflow-x-auto">
        <h3 className="mb-3 text-sm font-semibold text-white/80">
          Posição por palavra-chave
        </h3>
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-white/40">
              <th className="pb-2 pr-3">Keyword</th>
              <th className="pb-2 pr-3">Volume</th>
              <th className="pb-2 pr-3">Sua posição</th>
              <th className="pb-2 pr-3">Tipo resultado</th>
              <th className="pb-2 pr-3">Cliques est.</th>
              <th className="pb-2 pr-3">Tendência</th>
              {serp.trackedKeywords[0]?.competitorPositions.map((c) => (
                <th key={c.domain} className="pb-2 pr-3 font-medium">
                  {c.domain}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {serp.trackedKeywords.map((row) => (
              <KeywordRow key={row.keyword} row={row} primaryDomain={primaryDomain} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-brand/35 bg-brand/10 px-4 py-3"
          : "rounded-xl border border-white/8 bg-black/20 px-4 py-3"
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </p>
      <p
        className={
          highlight
            ? "mt-1 text-2xl font-bold text-brand-bright"
            : "mt-1 text-2xl font-bold text-white"
        }
      >
        {value}
      </p>
      <p className="text-[10px] text-white/40">{sub}</p>
    </div>
  );
}

function SerpVisualList({
  keyword,
  primaryDomain,
  competitors,
}: {
  keyword?: SerpKeywordRanking;
  primaryDomain: string;
  competitors: { domain: string; position: number | null }[];
}) {
  if (!keyword) {
    return <p className="text-sm text-white/45">Sem dados de keyword.</p>;
  }

  const slots: { position: number; domain: string; isYou: boolean; type?: SerpResultType }[] =
    [];
  slots.push({
    position: keyword.primaryPosition ?? 99,
    domain: primaryDomain,
    isYou: true,
    type: keyword.primaryResultType,
  });
  for (const c of competitors) {
    if (c.position !== null) {
      slots.push({ position: c.position, domain: c.domain, isYou: false });
    }
  }
  slots.sort((a, b) => a.position - b.position);

  const top10 = Array.from({ length: 10 }, (_, i) => {
    const pos = i + 1;
    const match = slots.find((s) => s.position === pos);
    return { pos, match };
  });

  return (
    <ol className="space-y-1 rounded-xl border border-white/10 bg-white p-3">
      {top10.map(({ pos, match }) => (
        <motion.li
          key={pos}
          initial={{ opacity: 0, x: -4 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: pos * 0.03 }}
          className={
            match?.isYou
              ? "rounded-lg border border-brand/40 bg-brand/5 px-3 py-2"
              : "rounded-lg px-3 py-2 hover:bg-black/[0.03]"
          }
        >
          <div className="flex items-start gap-2">
            <span className="w-6 shrink-0 font-mono text-xs text-[#70757a]">{pos}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-[#1a0dab]">
                {match
                  ? `https://${match.domain} › ${keyword.keyword.split(" ")[0]}`
                  : `concorrente-${pos}.com › página`}
              </p>
              <p className="line-clamp-1 text-xs text-[#4d5156]">
                {match?.isYou
                  ? `Seu resultado para “${keyword.keyword}” — ${RESULT_LABEL[match.type ?? "organic"]}`
                  : match
                    ? `Resultado orgânico — ${match.domain}`
                    : "Slot estimado na SERP"}
              </p>
            </div>
            {match?.isYou ? (
              <span className="shrink-0 rounded bg-brand/15 px-1.5 py-0.5 text-[10px] font-bold text-brand-bright">
                Você
              </span>
            ) : null}
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

function KeywordRow({
  row,
  primaryDomain,
}: {
  row: SerpKeywordRanking;
  primaryDomain: string;
}) {
  const trendIcon =
    row.trend === "up" ? "↑" : row.trend === "down" ? "↓" : "→";
  const trendColor =
    row.trend === "up"
      ? "text-emerald-400"
      : row.trend === "down"
        ? "text-brand-bright"
        : "text-white/45";

  return (
    <tr className="border-b border-white/[0.04]">
      <td className="py-3 pr-3 font-medium text-white/85">{row.keyword}</td>
      <td className="py-3 pr-3 text-white/50">{row.searchVolumeLabel}</td>
      <td className="py-3 pr-3">
        {row.primaryPosition !== null ? (
          <span className="font-bold text-brand-bright">#{row.primaryPosition}</span>
        ) : (
          <span className="text-white/35">50+</span>
        )}
      </td>
      <td className="py-3 pr-3 text-xs text-white/55">
        {RESULT_LABEL[row.primaryResultType]}
      </td>
      <td className="py-3 pr-3 font-mono text-white/60">{row.estimatedMonthlyClicks}</td>
      <td className={`py-3 pr-3 font-bold ${trendColor}`}>{trendIcon}</td>
      {row.competitorPositions.map((c) => (
        <td key={c.domain} className="py-3 pr-3 font-mono text-white/50">
          {c.position !== null ? `#${c.position}` : "—"}
        </td>
      ))}
    </tr>
  );
}
