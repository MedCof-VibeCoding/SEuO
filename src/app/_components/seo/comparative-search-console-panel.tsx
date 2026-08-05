"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  BarChart3,
  Clock,
  Globe2,
  Link2,
  Map,
  MonitorSmartphone,
  MousePointerClick,
  Percent,
  Search,
  Shield,
  Smartphone,
} from "lucide-react";
import Link from "next/link";

import { RankingChart } from "~/app/google-position-checker/_components/ranking-chart";
import { redirectToGoogleSignIn } from "~/features/auth/google-sign-in";
import type {
  ComparativeSearchConsoleData,
  GscAudienceBreakdownItem,
  GscUrlInspectionData,
} from "~/features/seo/types/analysis";

type ComparativeSearchConsolePanelProps = {
  data: ComparativeSearchConsoleData;
};

function formatImpressions(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}k`;
  return String(n);
}

function formatDate(value?: string): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR");
}

/**
 * Painel de SEO com dados reais do Google Search Console.
 */
export function ComparativeSearchConsolePanel({ data }: ComparativeSearchConsolePanelProps) {
  if (!data.connected) {
    return (
      <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 px-5 py-4">
        <p className="text-sm font-semibold text-amber-100/95">Search Console não conectado</p>
        <p className="mt-2 text-sm leading-relaxed text-white/60">{data.insight}</p>
        <button
          type="button"
          onClick={() => redirectToGoogleSignIn("/analyzer")}
          className="mt-4 inline-flex rounded-lg border border-brand/40 bg-brand/20 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand/30"
        >
          Entrar com Google
        </button>
      </div>
    );
  }

  if (!data.available) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/20 px-5 py-4">
        <p className="text-sm font-semibold text-white/85">Search Console conectado</p>
        <p className="mt-2 text-sm leading-relaxed text-white/55">{data.insight}</p>
        <p className="mt-3 truncate text-xs text-white/35">{data.targetUrl}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full border border-brand/30 bg-brand/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-bright">
          Search Console
        </span>
        {data.gscProperty ? (
          <span className="text-[10px] text-white/35">{data.gscProperty}</span>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          icon={BarChart3}
          label="Impressões (28d)"
          value={formatImpressions(data.totals.impressions)}
        />
        <MetricCard
          icon={MousePointerClick}
          label="Cliques (28d)"
          value={String(data.totals.clicks)}
        />
        <MetricCard icon={Percent} label="CTR médio" value={`${data.totals.ctr.toFixed(1)}%`} />
        <MetricCard
          icon={Search}
          label="Posição média"
          value={
            data.totals.averagePosition !== null ? `#${data.totals.averagePosition}` : "—"
          }
        />
      </div>

      {data.mainKeywordMetrics ? (
        <div className="rounded-xl border border-brand/20 bg-brand/5 px-4 py-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
            Palavra-chave principal
          </p>
          <p className="mt-1 text-sm font-medium text-brand-bright">
            “{data.mainKeywordMetrics.keyword}”
          </p>
          <div className="mt-2 flex flex-wrap gap-4 text-xs text-white/55">
            <span>
              Posição:{" "}
              {data.mainKeywordMetrics.position !== null
                ? `#${data.mainKeywordMetrics.position}`
                : "—"}
            </span>
            <span>{data.mainKeywordMetrics.clicks} cliques</span>
            <span>{data.mainKeywordMetrics.impressions} impressões</span>
            <span>CTR {data.mainKeywordMetrics.ctr.toFixed(1)}%</span>
          </div>
        </div>
      ) : null}

      <p className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-relaxed text-white/65">
        {data.insight}
      </p>

      {(data.countries?.length || data.devices?.length) ? (
        <Section
          icon={Globe2}
          title="Audiência por origem e dispositivo"
          description="Dados segmentados do Search Console (últimos 28 dias)."
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <BreakdownTable
              title="Países"
              icon={Map}
              empty="Sem dados de país para esta URL."
              rows={data.countries ?? []}
            />
            <BreakdownTable
              title="Dispositivos"
              icon={MonitorSmartphone}
              empty="Sem dados de dispositivo para esta URL."
              rows={data.devices ?? []}
            />
          </div>
        </Section>
      ) : null}

      {data.urlInspection ? (
        <Section
          icon={Search}
          title="Inspeção de URL"
          description="Diagnóstico individual de rastreamento e dados canônicos."
        >
          <UrlInspectionBlock inspection={data.urlInspection} />
        </Section>
      ) : null}

      {data.indexCoverage ? (
        <Section
          icon={Smartphone}
          title="Páginas indexadas e com impressões"
          description={data.indexCoverage.note}
        >
          {data.indexCoverage.targetInspection?.available ? (
            <div className="mb-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/70">
              <p>
                <span className="text-white/45">URL alvo — cobertura: </span>
                {data.indexCoverage.targetInspection.coverageState ?? "—"}
              </p>
              <p className="mt-1">
                <span className="text-white/45">Indexação: </span>
                {data.indexCoverage.targetInspection.indexingState ?? "—"}
              </p>
              <p className="mt-1">
                <span className="text-white/45">robots.txt: </span>
                {data.indexCoverage.targetInspection.robotsTxtState ?? "—"}
              </p>
              <p className="mt-1">
                <span className="text-white/45">Fetch: </span>
                {data.indexCoverage.targetInspection.pageFetchState ?? "—"}
              </p>
            </div>
          ) : null}

          {data.indexCoverage.pagesServingInSearch.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/[0.03] text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    <th className="px-4 py-3">URL (com impressões)</th>
                    <th className="px-4 py-3">Posição</th>
                    <th className="px-4 py-3">Cliques</th>
                    <th className="px-4 py-3">Impressões</th>
                  </tr>
                </thead>
                <tbody>
                  {data.indexCoverage.pagesServingInSearch.map((row) => (
                    <tr key={row.url} className="border-b border-white/5">
                      <td className="max-w-[320px] truncate px-4 py-3 text-white/80" title={row.url}>
                        {row.url}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-brand-bright">
                        {row.position !== null ? `#${row.position}` : "—"}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-white/60">{row.clicks}</td>
                      <td className="px-4 py-3 tabular-nums text-white/60">{row.impressions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-white/45">Nenhuma página com impressões no período.</p>
          )}
        </Section>
      ) : null}

      {data.sitemaps ? (
        <Section
          icon={Map}
          title="Sitemaps"
          description="Confirmação de envio e status de leitura dos mapas do site."
        >
          {data.sitemaps.length === 0 ? (
            <p className="text-sm text-white/45">
              Nenhum sitemap encontrado nesta propriedade do Search Console.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-white/8">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead>
                  <tr className="border-b border-white/8 bg-white/[0.03] text-[10px] font-semibold uppercase tracking-wider text-white/40">
                    <th className="px-4 py-3">Caminho</th>
                    <th className="px-4 py-3">Enviado</th>
                    <th className="px-4 py-3">Lido</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Erros</th>
                    <th className="px-4 py-3">Avisos</th>
                  </tr>
                </thead>
                <tbody>
                  {data.sitemaps.map((sitemap) => (
                    <tr key={sitemap.path} className="border-b border-white/5">
                      <td className="max-w-[280px] truncate px-4 py-3 text-white/80" title={sitemap.path}>
                        {sitemap.path}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/55">
                        {formatDate(sitemap.lastSubmitted)}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/55">
                        {formatDate(sitemap.lastDownloaded)}
                      </td>
                      <td className="px-4 py-3 text-xs text-white/55">
                        {sitemap.isPending ? "Pendente" : "Processado"}
                        {sitemap.isSitemapsIndex ? " · índice" : ""}
                      </td>
                      <td className="px-4 py-3 tabular-nums text-white/60">{sitemap.errors}</td>
                      <td className="px-4 py-3 tabular-nums text-white/60">{sitemap.warnings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>
      ) : null}

      {data.links ? (
        <Section
          icon={Link2}
          title="Links externos e internos"
          description={data.links.note}
        >
          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                URLs que apontam para a página (amostra GSC)
              </p>
              {data.links.inboundReferringUrls.length === 0 ? (
                <p className="mt-2 text-sm text-white/45">Nenhuma URL de referência na inspeção.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {data.links.inboundReferringUrls.map((url) => (
                    <li key={url} className="truncate text-xs text-white/65" title={url}>
                      {url}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/45">
                Páginas internas com mais impressões
              </p>
              {data.links.topInternalPages.length === 0 ? (
                <p className="mt-2 text-sm text-white/45">Sem páginas internas no período.</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {data.links.topInternalPages.slice(0, 10).map((page) => (
                    <li key={page.url} className="flex justify-between gap-3 text-xs text-white/65">
                      <span className="truncate" title={page.url}>
                        {page.url}
                      </span>
                      <span className="shrink-0 tabular-nums text-white/40">
                        {page.impressions} impr.
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </Section>
      ) : null}

      {data.security ? (
        <Section
          icon={Shield}
          title="Problemas de segurança"
          description={data.security.note}
        >
          <div
            className={[
              "rounded-xl border px-4 py-3",
              data.security.status === "issues_found"
                ? "border-amber-500/30 bg-amber-500/10"
                : data.security.status === "clear"
                  ? "border-emerald-500/25 bg-emerald-500/8"
                  : "border-white/10 bg-black/20",
            ].join(" ")}
          >
            <p className="text-sm font-semibold text-white/85">
              {data.security.status === "clear"
                ? "Nenhum sinal crítico na inspeção"
                : data.security.status === "issues_found"
                  ? "Sinais que merecem atenção"
                  : "Indisponível via API"}
            </p>
            {data.security.issues.length > 0 ? (
              <ul className="mt-3 space-y-2">
                {data.security.issues.map((issue) => (
                  <li key={issue.type} className="flex gap-2 text-sm text-white/70">
                    <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-300" aria-hidden />
                    <span>{issue.detail}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Section>
      ) : null}

      {data.topQueries.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-white/8">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-white/8 bg-white/[0.03] text-[10px] font-semibold uppercase tracking-wider text-white/40">
                <th className="px-4 py-3">Query</th>
                <th className="px-4 py-3">Posição</th>
                <th className="px-4 py-3">Cliques</th>
                <th className="px-4 py-3">Impressões</th>
                <th className="px-4 py-3">CTR</th>
              </tr>
            </thead>
            <tbody>
              {data.topQueries.map((row, i) => (
                <motion.tr
                  key={row.keyword}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className={
                    row.keyword === data.mainKeywordMetrics?.keyword
                      ? "border-b border-brand/15 bg-brand/8"
                      : "border-b border-white/5"
                  }
                >
                  <td className="px-4 py-3 font-medium text-white/85">{row.keyword}</td>
                  <td className="px-4 py-3 tabular-nums text-brand-bright">
                    {row.position !== null ? `#${row.position}` : "—"}
                  </td>
                  <td className="px-4 py-3 tabular-nums text-white/60">{row.clicks}</td>
                  <td className="px-4 py-3 tabular-nums text-white/60">{row.impressions}</td>
                  <td className="px-4 py-3 tabular-nums text-white/60">{row.ctr.toFixed(1)}%</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {data.positionHistory && data.positionHistory.length > 1 ? (
        <div className="rounded-xl border border-white/10 bg-black/20 p-5">
          <h3 className="mb-4 text-sm font-semibold text-white/85">
            Evolução de posição — “{data.mainKeyword ?? data.mainKeywordMetrics?.keyword}”
          </h3>
          <RankingChart data={data.positionHistory} />
          <p className="mt-2 text-[10px] text-white/35">
            Dados diários do Search Console (últimos 90 dias)
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] text-white/35">
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" aria-hidden />
          Atualizado {new Date(data.checkedAt).toLocaleString("pt-BR")} · últimos 28 dias
        </span>
        <Link
          href={`/google-position-checker?url=${encodeURIComponent(data.targetUrl)}`}
          className="text-brand-bright hover:underline"
        >
          Ver detalhes no Position Checker →
        </Link>
      </div>
    </div>
  );
}

function UrlInspectionBlock({ inspection }: { inspection: GscUrlInspectionData }) {
  if (!inspection.available) {
    return (
      <p className="text-sm text-white/55">
        {inspection.error ?? "Não foi possível inspecionar esta URL."}
      </p>
    );
  }

  const rows = [
    ["Cobertura", inspection.coverageState],
    ["Indexação", inspection.indexingState],
    ["Verdict", inspection.verdict],
    ["robots.txt", inspection.robotsTxtState],
    ["Fetch", inspection.pageFetchState],
    ["Rastreado como", inspection.crawledAs],
    ["Último crawl", formatDate(inspection.lastCrawlTime)],
    ["Canônico do usuário", inspection.userCanonical],
    ["Canônico do Google", inspection.googleCanonical],
  ] as const;

  return (
    <div className="space-y-3">
      <div className="grid gap-2 sm:grid-cols-2">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-white/40">{label}</p>
            <p className="mt-1 break-all text-sm text-white/75">{value ?? "—"}</p>
          </div>
        ))}
      </div>
      {inspection.inspectionResultLink ? (
        <a
          href={inspection.inspectionResultLink}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-brand-bright hover:underline"
        >
          Abrir no Search Console →
        </a>
      ) : null}
    </div>
  );
}

function BreakdownTable({
  title,
  icon: Icon,
  rows,
  empty,
}: {
  title: string;
  icon: typeof Globe2;
  rows: GscAudienceBreakdownItem[];
  empty: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="mb-3 flex items-center gap-2 text-white/55">
        <Icon className="h-3.5 w-3.5 text-brand-bright/80" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wider">{title}</p>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-white/45">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
                <th className="pb-2 pr-2">Segmento</th>
                <th className="pb-2 pr-2">Cliques</th>
                <th className="pb-2">Impressões</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-t border-white/5">
                  <td className="py-2 pr-2 text-white/80">{row.label}</td>
                  <td className="py-2 pr-2 tabular-nums text-white/60">{row.clicks}</td>
                  <td className="py-2 tabular-nums text-white/60">{row.impressions}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: typeof Globe2;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-brand-bright" aria-hidden />
          <h3 className="text-sm font-semibold text-white/90">{title}</h3>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-white/40">{description}</p>
      </div>
      {children}
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BarChart3;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-2 text-white/45">
        <Icon className="h-3.5 w-3.5 text-brand-bright/80" aria-hidden />
        <span className="text-[10px] font-semibold uppercase tracking-wide">{label}</span>
      </div>
      <p className="mt-1 text-lg font-bold text-white">{value}</p>
    </div>
  );
}
