import { ISSUE_PLAYBOOKS } from "~/features/seo/data/issue-playbooks";
import type {
  CompetitorAdvantage,
  ContentIntelligence,
  ContentStrategyInsight,
  DomainAnalysis,
  HighImpactChange,
  IntelligenceScores,
  KeywordGap,
  SeoAnalysisReport,
  SeoIssueDetail,
  UserPlan,
} from "~/features/seo/types/analysis";

const IMPACT_RANK = { high: 3, medium: 2, low: 1 };
const EFFORT_RANK = { low: 3, medium: 2, high: 1 };

/**
 * Gera explicações detalhadas a partir das métricas com falha ou alerta.
 */
export function buildIssueDetails(domains: DomainAnalysis[]): SeoIssueDetail[] {
  const primary = domains.find((d) => d.role === "primary");
  if (!primary) return [];

  const issues: SeoIssueDetail[] = [];

  for (const metric of primary.metrics) {
    if (metric.status === "pass") continue;
    const playbook = ISSUE_PLAYBOOKS[metric.id];
    if (!playbook) {
      issues.push({
        id: `issue-${metric.id}`,
        metricId: metric.id,
        title: metric.label,
        problem: `Métrica com score ${metric.score}/100 (${metric.displayValue}).`,
        seoImpact: "Pode limitar visibilidade orgânica e experiência do usuário.",
        conversionImpact: "Impacto indireto na taxa de conversão via UX e confiança.",
        priority: metric.status === "fail" ? "high" : "medium",
        effort: "medium",
        howToFix: "Audite a página e aplique boas práticas da categoria correspondente.",
        badExample: "Estado atual abaixo do benchmark do setor.",
        goodExample: "Implementação alinhada às diretrizes Google e UX moderna.",
        expectedResult: "Melhora gradual de score e competitividade.",
        category: metric.category,
      });
      continue;
    }
    issues.push({
      id: `issue-${metric.id}`,
      metricId: metric.id,
      ...playbook,
    });
  }

  return issues.sort(
    (a, b) =>
      (IMPACT_RANK[b.estimatedTrafficGain ?? "low"] +
        IMPACT_RANK[b.estimatedCtrGain ?? "low"]) -
      (IMPACT_RANK[a.estimatedTrafficGain ?? "low"] +
        IMPACT_RANK[a.estimatedCtrGain ?? "low"]),
  );
}

/**
 * Ordena melhorias por impacto × facilidade.
 */
export function buildHighImpactChanges(issues: SeoIssueDetail[]): HighImpactChange[] {
  return issues
    .map((issue, index) => {
      const score =
        IMPACT_RANK[issue.estimatedTrafficGain ?? "low"] * 2 +
        IMPACT_RANK[issue.estimatedCtrGain ?? "low"] +
        EFFORT_RANK[issue.effort];
      return { issue, score, index };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 8)
    .map(({ issue }, rank) => ({
      id: `impact-${issue.id}`,
      rank: rank + 1,
      title: issue.title,
      summary: issue.howToFix,
      trafficGain: issue.estimatedTrafficGain ?? "medium",
      ctrGain: issue.estimatedCtrGain ?? "medium",
      effort: issue.effort,
      rankingImpact:
        issue.priority === "critical" || issue.priority === "high"
          ? "high"
          : "medium",
    }));
}

/**
 * Scores de inteligência explicados visualmente.
 */
export function buildIntelligenceScores(domains: DomainAnalysis[]): IntelligenceScores {
  const primary = domains.find((d) => d.role === "primary");
  if (!primary) {
    return { seo: 0, content: 0, technical: 0, conversion: 0, authority: 0 };
  }
  const c = primary.categoryScores;
  return {
    seo: Math.round((c.technical + c.content + c.ux) / 3),
    content: c.content,
    technical: c.technical,
    conversion: c.ux,
    authority: 0,
  };
}

/**
 * Inteligência de copywriting e conteúdo (mock + heurísticas).
 */
export function buildContentIntelligence(domains: DomainAnalysis[]): ContentIntelligence {
  const primary = domains.find((d) => d.role === "primary");
  const contentScore = primary?.categoryScores.content ?? 50;
  const domain = primary?.domain ?? "seusite.com";

  return {
    persuasionScore: Math.min(95, contentScore + 8),
    searchIntent: "Informacional + comercial (usuário compara soluções antes de contratar)",
    clarityScore: Math.min(92, contentScore + 5),
    authorityScore: primary?.categoryScores.authority ?? 45,
    depthScore: contentScore,
    scannabilityScore: primary?.categoryScores.ux ?? 55,
    keywordStuffingRisk: contentScore < 55 ? "medium" : "low",
    semanticRelevance: Math.min(90, contentScore + 12),
    suggestions: {
      titles: [
        `${domain}: análise SEO e benchmark vs. concorrentes`,
        `Como ${domain} pode superar concorrentes no Google em 2026`,
      ],
      headings: [
        "Por que seu site perde cliques na SERP",
        "Checklist técnico em 15 minutos",
        "Estratégia de conteúdo para fechar gaps semânticos",
      ],
      ctas: [
        "Solicitar diagnóstico gratuito",
        "Ver comparativo completo",
        "Baixar plano de ação SEO",
      ],
      relatedKeywords: [
        "auditoria SEO",
        "análise de concorrentes",
        "Core Web Vitals",
        "otimização de CTR",
      ],
      entities: ["Google Search", "schema.org", "Lighthouse", "E-E-A-T", "SERP"],
      faqs: [
        "Como melhorar CTR sem mudar posição?",
        "Quanto tempo leva para ver resultado de SEO técnico?",
        "O que priorizar: conteúdo ou performance?",
      ],
      contentStructure: [
        "Hero com proposta de valor + prova social",
        "H2 por intenção de busca (problema → solução → prova)",
        "FAQ com schema FAQPage",
        "CTA fixo após bloco de benefícios",
      ],
    },
  };
}

export function buildContentStrategy(
  domains: DomainAnalysis[],
): ContentStrategyInsight {
  const primary = domains.find((d) => d.role === "primary");
  const competitors = domains.filter((d) => d.role === "competitor");

  const metricNum = (value: string | number | boolean | undefined) =>
    typeof value === "number" ? value : Number(value) || 0;

  const primaryWords = metricNum(
    primary?.metrics.find((m) => m.id === "content-length")?.value,
  );
  const compWords = competitors.map((c) =>
    metricNum(c.metrics.find((m) => m.id === "content-length")?.value),
  );
  const avgComp =
    compWords.length > 0
      ? compWords.reduce((a, b) => a + b, 0) / compWords.length
      : 0;

  return {
    missingTopics: [
      "Comparativo direto com concorrentes",
      "Estudos de caso com métricas reais",
      "Glossário / hub de aprendizado",
    ],
    semanticGaps: [
      "Entidades de nicho pouco mencionadas",
      "Cobertura fraca de intenção transacional",
    ],
    competitorKeywords: [
      "software SEO",
      "rank tracking",
      "auditoria técnica",
      "link building",
    ],
    userQuestions: [
      "Qual a diferença entre SEO técnico e de conteúdo?",
      "Como saber se meu concorrente ranqueia melhor?",
      "O que é E-E-A-T na prática?",
    ],
    clusterSuggestions: [
      `Hub: SEO para ${primary?.domain ?? "marca"}`,
      "Cluster: Core Web Vitals",
      "Cluster: Copywriting para SERP",
    ],
    ...(avgComp > Number(primaryWords)
      ? {
          semanticGaps: [
            `Conteúdo ~${Math.round(((Number(avgComp) - Number(primaryWords)) / Number(avgComp)) * 100)}% mais curto que a média dos concorrentes`,
            "Menos entidades semânticas e FAQs estruturadas",
          ],
        }
      : {}),
  };
}

export function buildCompetitorAdvantages(
  domains: DomainAnalysis[],
): CompetitorAdvantage[] {
  const primary = domains.find((d) => d.role === "primary");
  if (!primary) return [];

  return domains
    .filter((d) => d.role === "competitor")
    .map((comp) => {
      const perfGap =
        comp.categoryScores.performance - primary.categoryScores.performance;
      const contentGap =
        comp.categoryScores.content - primary.categoryScores.content;
      let pattern = "Performance equilibrada";
      let explanation = `${comp.domain} está no mesmo patamar técnico.`;
      let opportunity = "Diferencie com conteúdo e autoridade.";

      if (perfGap > 8) {
        pattern = "Performance superior";
        explanation = `${comp.domain} entrega páginas mais rápidas (score ${comp.categoryScores.performance} vs ${primary.categoryScores.performance}).`;
        opportunity = "Priorize LCP, TTFB e redução de JS.";
      } else if (contentGap > 8) {
        pattern = "Conteúdo mais profundo";
        explanation = `${comp.domain} cobre mais intenções e entidades semânticas do nicho.`;
        opportunity = "Expanda clusters de conteúdo e FAQs com schema.";
      }

      return { domain: comp.domain, pattern, explanation, opportunity };
    });
}

export function buildKeywordGaps(domains: DomainAnalysis[]): KeywordGap[] {
  const keywords = [
    { keyword: "auditoria seo", intent: "Transacional" },
    { keyword: "comparar sites seo", intent: "Comercial" },
    { keyword: "core web vitals", intent: "Informacional" },
    { keyword: "aumentar ctr google", intent: "Informacional" },
    { keyword: "analise concorrentes", intent: "Comercial" },
  ];

  const hasCompetitors = domains.some((d) => d.role === "competitor");

  return keywords.map((k, i) => ({
    keyword: k.keyword,
    usedByCompetitors: hasCompetitors && i < 4,
    opportunity: i < 2 ? "high" : i < 4 ? "medium" : "low",
    searchIntent: k.intent,
  }));
}

/**
 * Aplica limites do plano free ao relatório (insights parciais).
 */
export function applyPlanLimits(report: SeoAnalysisReport, plan: UserPlan): SeoAnalysisReport {
  if (plan === "pro") return report;
  return {
    ...report,
    issueDetails: report.issueDetails.slice(0, 3),
    insights: report.insights.slice(0, 4),
    plan30Days: report.plan30Days.slice(0, 2),
  };
}
