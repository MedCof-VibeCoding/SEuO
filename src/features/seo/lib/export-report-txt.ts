import {
  buildComparativeInsights,
  buildCompetitorSeoNarrative,
  getContentPatterns,
  getOnPagePatterns,
  sliceKeywords,
} from "~/features/seo/lib/comparative-display";
import { CATEGORY_LABELS } from "~/features/seo/services/comparison-engine";
import type { SeoAnalysisReport } from "~/features/seo/types/analysis";

function section(title: string, lines: string[]): string {
  if (!lines.length) return "";
  return `\n${title}\n${"=".repeat(Math.min(title.length, 48))}\n${lines.join("\n")}\n`;
}

function listItems(items: string[]): string[] {
  return items.map((item) => `  • ${item}`);
}

/**
 * Gera relatório em texto puro da análise comparativa.
 */
export function buildReportTxt(report: SeoAnalysisReport): string {
  const lines: string[] = [
    "SEuO SEO — Relatório de Análise Comparativa",
    `Gerado em: ${new Date(report.createdAt).toLocaleString("pt-BR")}`,
    `Artigo-alvo: ${report.targetUrl ?? report.primaryDomain}`,
  ];

  if (report.mainKeyword) {
    lines.push(`Palavra-chave: ${report.mainKeyword}`);
  }

  if (report.competitorUrls?.length) {
    lines.push(`Concorrentes: ${report.competitorUrls.join(", ")}`);
  }

  const article = report.comparativeArticle;
  if (article) {
    const kw = sliceKeywords(article.keywords);
    lines.push(
      section("COLETA DE DADOS", [article.collectionNotes]),
      section("PALAVRAS-CHAVE", listItems(kw.top)),
      section("PALAVRAS-CHAVE NÃO USADAS", listItems(kw.gaps)),
      section("SUGESTÕES DE QUICKWINS", listItems(kw.quickWins)),
      section("CAUDA LONGA", listItems(kw.longTail)),
    );

    const patterns = getContentPatterns(article.content.content_patterns);
    lines.push(
      section(
        "PADRÕES DE CONTEÚDO",
        patterns.map((p) => `  ${p.label}: ${p.value}`),
      ),
    );

    const onPage = getOnPagePatterns(article.content.on_page_patterns);
    lines.push(
      section(
        "PADRÕES ON-PAGE",
        onPage.map((p) => `  ${p.label}: ${p.value}`),
      ),
      section(
        "OPORTUNIDADES DE OTIMIZAÇÃO",
        listItems(article.content.content_opportunities),
      ),
      section("PLANO — CURTO PRAZO", listItems(article.actionPlan.short_term)),
      section("PLANO — MÉDIO PRAZO", listItems(article.actionPlan.medium_term)),
      section("PLANO — LONGO PRAZO", listItems(article.actionPlan.long_term)),
    );
  }

  lines.push(
    section(
      "QUALIDADE DE SEO",
      report.domains.map(
        (d) =>
          `  ${d.domain} (${d.role === "primary" ? "Alvo" : "Concorrente"}): ${d.overallScore}/100 — #${d.rank}`,
      ),
    ),
    section(
      "SCORES DE INTELIGÊNCIA",
      Object.entries(report.intelligenceScores).map(([k, v]) => `  ${k}: ${v}`),
    ),
    section(
      "RANKING POR CATEGORIA",
      Object.keys(CATEGORY_LABELS).flatMap((cat) => {
        const label = CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS];
        const row = report.domains
          .map((d) => `${d.domain}=${d.categoryScores[cat as keyof typeof d.categoryScores]}`)
          .join(" | ");
        return [`  ${label}: ${row}`];
      }),
    ),
    section(
      "POR QUE CONCORRENTES PERFORMAM MELHOR",
      article ? [buildCompetitorSeoNarrative(article)] : [],
    ),
    section(
      "GAPS DE PALAVRAS-CHAVE",
      report.keywordGaps.map((g) => `  • ${g.keyword} (${g.opportunity})`),
    ),
    ...(report.searchConsole?.available
      ? [
          section("SEARCH CONSOLE (28 DIAS)", [
            `  Impressões: ${report.searchConsole.totals.impressions}`,
            `  Cliques: ${report.searchConsole.totals.clicks}`,
            `  CTR: ${report.searchConsole.totals.ctr.toFixed(1)}%`,
            `  Posição média: ${report.searchConsole.totals.averagePosition ?? "—"}`,
            report.searchConsole.insight,
            ...report.searchConsole.topQueries.slice(0, 10).map(
              (q) =>
                `  • “${q.keyword}” — #${q.position ?? "—"}, ${q.clicks} cliques, ${q.impressions} impressões`,
            ),
            ...(report.searchConsole.countries?.length
              ? [
                  "  Países:",
                  ...report.searchConsole.countries.slice(0, 8).map(
                    (c) =>
                      `    • ${c.label}: ${c.clicks} cliques, ${c.impressions} impressões`,
                  ),
                ]
              : []),
            ...(report.searchConsole.devices?.length
              ? [
                  "  Dispositivos:",
                  ...report.searchConsole.devices.map(
                    (d) =>
                      `    • ${d.label}: ${d.clicks} cliques, ${d.impressions} impressões`,
                  ),
                ]
              : []),
            ...(report.searchConsole.urlInspection?.available
              ? [
                  "  Inspeção de URL:",
                  `    Cobertura: ${report.searchConsole.urlInspection.coverageState ?? "—"}`,
                  `    Indexação: ${report.searchConsole.urlInspection.indexingState ?? "—"}`,
                  `    robots.txt: ${report.searchConsole.urlInspection.robotsTxtState ?? "—"}`,
                  `    Canônico Google: ${report.searchConsole.urlInspection.googleCanonical ?? "—"}`,
                ]
              : []),
            ...(report.searchConsole.sitemaps?.length
              ? [
                  "  Sitemaps:",
                  ...report.searchConsole.sitemaps.map(
                    (s) =>
                      `    • ${s.path} — erros: ${s.errors}, avisos: ${s.warnings}, ${s.isPending ? "pendente" : "processado"}`,
                  ),
                ]
              : []),
            ...(report.searchConsole.security
              ? [
                  `  Segurança: ${report.searchConsole.security.status}`,
                  report.searchConsole.security.note,
                  ...report.searchConsole.security.issues.map((i) => `    • ${i.detail}`),
                ]
              : []),
          ]),
        ]
      : []),
    section("ESTRATÉGIA — O QUE FALTA NO SEU TEXTO", listItems(report.contentStrategy.missingTopics)),
    section(
      "ESTRATÉGIA — COMO MELHORAR O CONTEÚDO",
      listItems(report.contentStrategy.semanticGaps),
    ),
    section(
      "INSIGHTS INTELIGENTES",
      (article ? buildComparativeInsights(article) : report.insights).map(
        (i) => `  [${i.type === "win" ? "Quick win" : "Conteúdo"}] ${i.title}`,
      ),
    ),
    section(
      "O QUE OTIMIZAR AGORA",
      report.recommendations.map((r) => `  • ${r.title} — ${r.description}`),
    ),
    section(
      "PLANO SEO 30 DIAS",
      report.plan30Days.flatMap((w) => [
        `  Semana ${w.week}: ${w.focus}`,
        ...w.tasks.map((t) => `    - ${t}`),
      ]),
    ),
  );

  return lines.filter(Boolean).join("\n").trim() + "\n";
}

/**
 * Faz download do relatório como arquivo .txt.
 */
export function downloadReportTxt(report: SeoAnalysisReport): void {
  const content = buildReportTxt(report);
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const slug = report.primaryDomain.replace(/[^a-z0-9]+/gi, "-").slice(0, 40);
  anchor.href = url;
  anchor.download = `seuo-analise-${slug || report.id}.txt`;
  anchor.click();
  URL.revokeObjectURL(url);
}
