import "server-only";

import type {
  ClarityBreakdownItem,
  ClarityClickData,
  ClarityDashboardData,
  ClarityIssueItem,
} from "~/features/seo/types/clarity";
import {
  fetchClarityInsights,
  type ClarityMetric,
} from "~/server/clarity/clarity-api";

type ClarityRow = Record<string, unknown>;

const ISSUE_METRICS = [
  { key: "ScriptErrorCount", label: "Erros de JavaScript" },
  { key: "ErrorClickCount", label: "Cliques com erro" },
  { key: "DeadClickCount", label: "Cliques sem resposta" },
  { key: "RageClickCount", label: "Cliques de frustração" },
  { key: "QuickbackClick", label: "Retornos rápidos" },
  { key: "ExcessiveScroll", label: "Rolagem excessiva" },
] as const;

const CLICK_METRICS = [
  { key: "DeadClickCount", field: "deadClicks" },
  { key: "RageClickCount", field: "rageClicks" },
  { key: "ErrorClickCount", field: "errorClicks" },
  { key: "QuickbackClick", field: "quickbackClicks" },
] as const;

const URL_FIELDS = ["URL", "Url", "url"];

/**
 * A API do Clarity permite apenas 10 chamadas por dia, então as respostas brutas
 * são compartilhadas entre análises e reaproveitadas por 30 minutos.
 */
const RAW_CACHE_TTL_MS = 30 * 60 * 1000;

type RawClarityData = {
  deviceBrowser: ClarityMetric[];
  osCountry: ClarityMetric[];
};

let rawCache: { expiresAt: number; data: RawClarityData } | null = null;

/**
 * Busca (ou reaproveita) as respostas brutas do Clarity segmentadas por URL.
 */
async function fetchRawClarityData(): Promise<RawClarityData> {
  if (rawCache && rawCache.expiresAt > Date.now()) {
    return rawCache.data;
  }

  const [deviceBrowser, osCountry] = await Promise.all([
    fetchClarityInsights({
      numOfDays: 3,
      dimensions: ["URL", "Device", "Browser"],
    }),
    fetchClarityInsights({
      numOfDays: 3,
      dimensions: ["URL", "OS", "Country/Region"],
    }),
  ]);

  const data = { deviceBrowser, osCountry };
  rawCache = { expiresAt: Date.now() + RAW_CACHE_TTL_MS, data };
  return data;
}

/**
 * Monta as métricas do Clarity restritas à URL analisada.
 */
export async function buildClarityDashboard(
  targetUrl: string,
): Promise<ClarityDashboardData> {
  const raw = await fetchRawClarityData();

  const deviceBrowser = filterMetricsByUrl(raw.deviceBrowser, targetUrl);
  const osCountry = filterMetricsByUrl(raw.osCountry, targetUrl);

  const trafficRows = metricRows(deviceBrowser, "Traffic");
  const matched = trafficRows.length > 0 || metricRows(osCountry, "Traffic").length > 0;

  const sessions = sumField(trafficRows, ["totalSessionCount"]);
  const pagesPerSession = weightedAverage(
    trafficRows,
    ["PagesPerSessionPercentage", "pagesPerSession"],
    ["totalSessionCount"],
  );

  return {
    source: "microsoft_clarity",
    numOfDays: 3,
    fetchedAt: new Date().toISOString(),
    targetUrl,
    matched,
    traffic: {
      sessions,
      pageViews: sumField(trafficRows, ["pagesViews", "pageViews"]),
      pagesPerSession,
    },
    clicks: buildClicks(deviceBrowser),
    issues: buildIssues(deviceBrowser),
    breakdowns: {
      devices: buildBreakdown(trafficRows, "Device"),
      browsers: buildBreakdown(trafficRows, "Browser"),
      operatingSystems: buildBreakdown(metricRows(osCountry, "Traffic"), "OS"),
      countries: buildBreakdown(metricRows(osCountry, "Traffic"), "Country/Region"),
    },
    limitations: [
      "Todos os números desta seção referem-se somente à URL analisada.",
      "Dead clicks, rage clicks e error clicks indicam problemas de UX e CTA, não ranking orgânico.",
      "A Data Export API não fornece Core Web Vitals nem tempos de carregamento.",
      "Dados agregados em UTC, cobrindo as últimas 72 horas.",
    ],
  };
}

/**
 * Mantém apenas as linhas cuja dimensão URL corresponde à página analisada.
 */
function filterMetricsByUrl(
  metrics: ClarityMetric[],
  targetUrl: string,
): ClarityMetric[] {
  return metrics.map((metric) => ({
    metricName: metric.metricName,
    information: metric.information.filter((row) =>
      samePage(stringField(row, URL_FIELDS), targetUrl),
    ),
  }));
}

/**
 * Soma os cliques problemáticos registrados na URL analisada.
 */
function buildClicks(metrics: ClarityMetric[]): ClarityClickData {
  const totals = {
    deadClicks: 0,
    rageClicks: 0,
    errorClicks: 0,
    quickbackClicks: 0,
  };

  for (const { key, field } of CLICK_METRICS) {
    totals[field] = sumField(metricRows(metrics, key), [
      "subTotal",
      "pagesViews",
      "pageViews",
    ]);
  }

  const totalProblemClicks =
    totals.deadClicks +
    totals.rageClicks +
    totals.errorClicks +
    totals.quickbackClicks;

  return { ...totals, totalProblemClicks, insights: buildClickInsights(totals) };
}

/**
 * Gera recomendações a partir dos cliques observados na URL analisada.
 */
function buildClickInsights(totals: {
  deadClicks: number;
  rageClicks: number;
  errorClicks: number;
  quickbackClicks: number;
}): string[] {
  const insights: string[] = [];

  if (totals.deadClicks > 0) {
    insights.push(
      `${formatCount(totals.deadClicks)} dead clicks nesta página: revise botões, CTAs e elementos que parecem clicáveis mas não respondem.`,
    );
  }
  if (totals.rageClicks > 0) {
    insights.push(
      `${formatCount(totals.rageClicks)} rage clicks nesta página: investigue formulários, pop-ups e travamentos percebidos.`,
    );
  }
  if (totals.errorClicks > 0) {
    insights.push(
      `${formatCount(totals.errorClicks)} cliques com erro nesta página: priorize a correção de JavaScript e interações quebradas.`,
    );
  }
  if (totals.quickbackClicks > 0) {
    insights.push(
      `${formatCount(totals.quickbackClicks)} retornos rápidos nesta página: o conteúdo inicial pode não corresponder à intenção de busca.`,
    );
  }
  if (!insights.length) {
    insights.push(
      "Nenhum clique problemático foi registrado nesta URL nas últimas 72 horas.",
    );
  }

  return insights;
}

/**
 * Consolida erros e sinais de frustração da URL analisada.
 */
function buildIssues(metrics: ClarityMetric[]): ClarityIssueItem[] {
  return ISSUE_METRICS.map(({ key, label }) => {
    const rows = metricRows(metrics, key);
    const count = sumField(rows, ["subTotal", "pagesViews", "pageViews"]);
    const totalSessions = sumField(rows, ["sessionsCount"]);
    const affectedSessions = Math.round(
      rows.reduce((total, row) => {
        const rowSessions = numberField(row, ["sessionsCount"]);
        const percentage = numberField(row, ["sessionsWithMetricPercentage"]);
        return total + rowSessions * (percentage / 100);
      }, 0),
    );
    const affectedPercentage =
      totalSessions > 0 ? round((affectedSessions / totalSessions) * 100, 1) : 0;

    return {
      key,
      label,
      count,
      affectedSessions,
      affectedPercentage,
      severity:
        affectedPercentage >= 5
          ? "critical"
          : affectedPercentage >= 2
            ? "warning"
            : "info",
    };
  });
}

/**
 * Agrupa sessões da URL analisada por uma dimensão.
 */
function buildBreakdown(
  rows: ClarityRow[],
  dimension: string,
): ClarityBreakdownItem[] {
  const grouped = new Map<string, number>();
  for (const row of rows) {
    const value = row[dimension];
    const label =
      typeof value === "string" && value.trim() ? value.trim() : "Não identificado";
    const sessions = numberField(row, ["totalSessionCount", "sessionsCount"]);
    grouped.set(label, (grouped.get(label) ?? 0) + sessions);
  }

  const total = [...grouped.values()].reduce((sum, value) => sum + value, 0);
  return [...grouped.entries()]
    .map(([label, sessions]) => ({
      label,
      sessions,
      share: total > 0 ? round((sessions / total) * 100, 1) : 0,
    }))
    .sort((a, b) => b.sessions - a.sessions)
    .slice(0, 8);
}

/**
 * Localiza as linhas de uma métrica tolerando espaços na nomenclatura.
 */
function metricRows(metrics: ClarityMetric[], metricName: string): ClarityRow[] {
  const normalized = normalizeMetricName(metricName);
  return (
    metrics.find((metric) => normalizeMetricName(metric.metricName) === normalized)
      ?.information ?? []
  );
}

/**
 * Normaliza nomes de métricas para comparação.
 */
function normalizeMetricName(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Soma o primeiro campo numérico disponível em cada linha.
 */
function sumField(rows: ClarityRow[], fields: string[]): number {
  return Math.round(
    rows.reduce((total, row) => total + numberField(row, fields), 0),
  );
}

/**
 * Lê um campo numérico mesmo quando a API o retorna como texto.
 */
function numberField(row: ClarityRow, fields: string[]): number {
  for (const field of fields) {
    const value = row[field];
    const parsed =
      typeof value === "number"
        ? value
        : typeof value === "string"
          ? Number(value.replace(",", "."))
          : Number.NaN;
    if (Number.isFinite(parsed)) return parsed;
  }
  return 0;
}

/**
 * Lê o primeiro campo textual disponível.
 */
function stringField(row: ClarityRow, fields: string[]): string {
  for (const field of fields) {
    const value = row[field];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return "";
}

/**
 * Calcula média ponderada por sessões.
 */
function weightedAverage(
  rows: ClarityRow[],
  valueFields: string[],
  weightFields: string[],
): number | null {
  let weightedTotal = 0;
  let totalWeight = 0;
  for (const row of rows) {
    const value = numberField(row, valueFields);
    const weight = numberField(row, weightFields);
    if (weight <= 0) continue;
    weightedTotal += value * weight;
    totalWeight += weight;
  }
  return totalWeight > 0 ? round(weightedTotal / totalWeight, 2) : null;
}

/**
 * Compara URLs removendo protocolo, www, query e barra final.
 */
function samePage(left: string, right: string): boolean {
  return normalizeUrl(left) === normalizeUrl(right);
}

/**
 * Normaliza URL para comparação.
 */
function normalizeUrl(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[?#].*$/, "")
    .replace(/\/$/, "");
}

/**
 * Formata contagens para os insights.
 */
function formatCount(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}

/**
 * Arredonda valores para apresentação.
 */
function round(value: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}
