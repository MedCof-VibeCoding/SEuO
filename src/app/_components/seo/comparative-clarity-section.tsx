"use client";

import {
  AlertTriangle,
  BarChart3,
  Compass,
  Globe2,
  Laptop,
  Loader2,
  MonitorSmartphone,
  MousePointerClick,
  RefreshCw,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import type {
  ClarityBreakdownItem,
  ClarityDashboardData,
  ClarityIssueItem,
} from "~/features/seo/types/clarity";

type ComparativeClaritySectionProps = {
  targetUrl?: string;
};

/**
 * Exibe tráfego, cliques e erros do Microsoft Clarity apenas da URL analisada.
 */
export function ComparativeClaritySection({
  targetUrl,
}: ComparativeClaritySectionProps) {
  const [data, setData] = useState<ClarityDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);

  const load = useCallback(async () => {
    if (!targetUrl) {
      setError({ code: "MISSING_TARGET_URL", message: "URL analisada não informada." });
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/seo/clarity/dashboard?targetUrl=${encodeURIComponent(targetUrl)}`,
      );
      const payload = (await response.json()) as {
        result?: ClarityDashboardData;
        error?: string;
        message?: string;
      };
      if (!response.ok || !payload.result) {
        setError({
          code: payload.error ?? "CLARITY_API_ERROR",
          message: payload.message ?? "Não foi possível consultar o Clarity.",
        });
        return;
      }
      setData(payload.result);
    } catch {
      setError({
        code: "NETWORK_ERROR",
        message: "Erro de conexão ao consultar o Microsoft Clarity.",
      });
    } finally {
      setLoading(false);
    }
  }, [targetUrl]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex min-h-32 items-center justify-center gap-2 text-sm text-white/45">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
        Consultando o Clarity para a URL analisada…
      </div>
    );
  }

  if (error || !data) {
    const rateLimited = error?.code === "CLARITY_RATE_LIMITED";
    return (
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-amber-100">
              {rateLimited ? "Cota diária do Clarity esgotada" : "Clarity indisponível"}
            </p>
            <p className="mt-1 text-sm leading-relaxed text-white/55">
              {error?.message ?? "Não foi possível consultar o Clarity."}
            </p>
            {rateLimited ? null : (
              <button
                type="button"
                onClick={() => void load()}
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-1.5 text-xs text-white/65 transition hover:bg-white/5"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden />
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-white/[0.07] bg-white/[0.02] px-4 py-3">
        <p className="min-w-0 truncate text-sm text-white/70" title={data.targetUrl}>
          <span className="text-white/40">URL analisada: </span>
          {data.targetUrl}
        </p>
        <span className="rounded-full border border-sky-400/20 bg-sky-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-sky-200">
          Microsoft Clarity · 72h
        </span>
      </div>

      {!data.matched ? (
        <div className="rounded-xl border border-amber-400/20 bg-amber-400/[0.06] p-4 text-sm text-white/60">
          O Clarity não registrou sessões para esta URL nas últimas 72 horas. Verifique se a
          página recebe tráfego e se o script de rastreamento está instalado nela.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <MetricCard
          icon={Users}
          label="Sessões na página"
          value={formatNumber(data.traffic.sessions)}
        />
        <MetricCard
          icon={BarChart3}
          label="Visualizações"
          value={formatNumber(data.traffic.pageViews)}
        />
        <MetricCard
          icon={MousePointerClick}
          label="Páginas por sessão"
          value={data.traffic.pagesPerSession?.toLocaleString("pt-BR") ?? "—"}
        />
      </div>

      <section>
        <h3 className="text-sm font-semibold text-white/85">Dados de clique da página</h3>
        <p className="mt-1 text-xs text-white/40">
          Sinais de fricção registrados nesta URL
        </p>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={MousePointerClick}
            label="Dead clicks"
            value={formatNumber(data.clicks.deadClicks)}
          />
          <MetricCard
            icon={AlertTriangle}
            label="Rage clicks"
            value={formatNumber(data.clicks.rageClicks)}
          />
          <MetricCard
            icon={AlertTriangle}
            label="Error clicks"
            value={formatNumber(data.clicks.errorClicks)}
          />
          <MetricCard
            icon={RefreshCw}
            label="Quickbacks"
            value={formatNumber(data.clicks.quickbackClicks)}
          />
        </div>

        <ul className="mt-4 space-y-1.5 rounded-xl border border-brand/20 bg-brand/[0.06] p-4 text-sm text-white/70">
          {data.clicks.insights.map((insight) => (
            <li key={insight}>• {insight}</li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-white/85">
          Erros e sinais de problemas na página
        </h3>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.issues.map((issue) => (
            <IssueCard key={issue.key} issue={issue} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-3 text-sm font-semibold text-white/85">
          Tráfego da página por segmento
        </h3>
        <div className="grid gap-4 lg:grid-cols-2">
          <BreakdownPanel
            icon={MonitorSmartphone}
            title="Dispositivos"
            items={data.breakdowns.devices}
          />
          <BreakdownPanel
            icon={Compass}
            title="Navegadores"
            items={data.breakdowns.browsers}
          />
          <BreakdownPanel
            icon={Laptop}
            title="Sistemas operacionais"
            items={data.breakdowns.operatingSystems}
          />
          <BreakdownPanel
            icon={Globe2}
            title="Países de origem"
            items={data.breakdowns.countries}
          />
        </div>
      </section>

      <ul className="space-y-1 text-[11px] text-white/35">
        {data.limitations.map((limitation) => (
          <li key={limitation}>• {limitation}</li>
        ))}
      </ul>
    </div>
  );
}

/**
 * Card de métrica da página analisada.
 */
function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
      <Icon className="h-4 w-4 text-brand-bright" aria-hidden />
      <p className="mt-3 text-xs text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-bold tabular-nums text-white">{value}</p>
    </div>
  );
}

/**
 * Card de erro ou sinal comportamental.
 */
function IssueCard({ issue }: { issue: ClarityIssueItem }) {
  const styles = {
    critical: "border-red-400/25 bg-red-400/[0.07] text-red-200",
    warning: "border-amber-400/25 bg-amber-400/[0.07] text-amber-200",
    info: "border-white/[0.07] bg-white/[0.025] text-white/65",
  }[issue.severity];

  return (
    <div className={`rounded-xl border p-4 ${styles}`}>
      <p className="text-xs font-semibold">{issue.label}</p>
      <div className="mt-2 flex items-end justify-between gap-3">
        <p className="text-2xl font-bold tabular-nums">{formatNumber(issue.count)}</p>
        <p className="text-xs opacity-70">
          {issue.affectedPercentage.toLocaleString("pt-BR")}% das sessões
        </p>
      </div>
    </div>
  );
}

/**
 * Lista de segmentos com barras proporcionais.
 */
function BreakdownPanel({
  icon: Icon,
  title,
  items,
}: {
  icon: typeof Users;
  title: string;
  items: ClarityBreakdownItem[];
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-brand-bright" aria-hidden />
        <h4 className="text-sm font-semibold text-white/80">{title}</h4>
      </div>
      {items.length ? (
        <ol className="mt-4 space-y-3">
          {items.map((item) => (
            <li key={item.label}>
              <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                <span className="truncate text-white/60" title={item.label}>
                  {item.label}
                </span>
                <span className="shrink-0 tabular-nums text-white/40">
                  {formatNumber(item.sessions)} · {item.share.toLocaleString("pt-BR")}%
                </span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-brand"
                  style={{ width: `${Math.max(2, item.share)}%` }}
                />
              </div>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-4 text-sm text-white/35">Sem dados no período.</p>
      )}
    </div>
  );
}

/**
 * Formata contagens no padrão brasileiro.
 */
function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}
