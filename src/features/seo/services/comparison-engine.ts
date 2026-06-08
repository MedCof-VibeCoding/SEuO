import type {
  ComparisonWinner,
  DomainAnalysis,
  SeoCategory,
  SeoInsight,
  SeoRecommendation,
  ThirtyDayPlanItem,
} from "~/features/seo/types/analysis";

const CATEGORY_LABELS: Record<SeoCategory, string> = {
  technical: "SEO técnico",
  performance: "Performance",
  content: "Conteúdo",
  authority: "Autoridade",
  ux: "UX e conversão",
};

/**
 * Ordena domínios por score geral e atribui ranking.
 */
export function rankDomains(domains: Omit<DomainAnalysis, "rank">[]): DomainAnalysis[] {
  return [...domains]
    .sort((a, b) => b.overallScore - a.overallScore)
    .map((d, i) => ({ ...d, rank: i + 1 }));
}

/**
 * Identifica vencedor por categoria e margem percentual vs. domínio principal.
 */
export function computeWinners(domains: DomainAnalysis[]): ComparisonWinner[] {
  const categories = Object.keys(CATEGORY_LABELS) as SeoCategory[];
  const primary = domains.find((d) => d.role === "primary");
  if (!primary) return [];

  return categories.map((category) => {
    const sorted = [...domains].sort(
      (a, b) => b.categoryScores[category] - a.categoryScores[category],
    );
    const winner = sorted[0]!;
    const primaryScore = primary.categoryScores[category];
    const margin =
      primaryScore > 0
        ? Math.round(((winner.categoryScores[category] - primaryScore) / primaryScore) * 100)
        : winner.categoryScores[category];

    return {
      category,
      domain: winner.domain,
      marginPercent: margin,
    };
  });
}

/**
 * Gera insights comparativos (regras + templates).
 */
export function generateInsights(domains: DomainAnalysis[]): SeoInsight[] {
  const primary = domains.find((d) => d.role === "primary");
  if (!primary) return [];

  const insights: SeoInsight[] = [];
  const competitors = domains.filter((d) => d.role === "competitor");
  const bestCompetitor = competitors.sort((a, b) => b.overallScore - a.overallScore)[0];

  if (bestCompetitor && bestCompetitor.overallScore > primary.overallScore) {
    const diff = bestCompetitor.overallScore - primary.overallScore;
    insights.push({
      id: "overall-gap",
      type: "warning",
      title: "Concorrente à frente no score geral",
      description: `${bestCompetitor.domain} está ${diff} pontos acima do seu site no índice SEO consolidado.`,
      impact: "high",
    });
  }

  const perfPrimary = primary.metrics.find((m) => m.id === "load-time");
  const perfComp = bestCompetitor?.metrics.find((m) => m.id === "load-time");
  if (
    perfPrimary &&
    perfComp &&
    typeof perfPrimary.value === "number" &&
    typeof perfComp.value === "number" &&
    perfComp.value < perfPrimary.value
  ) {
    const pct = Math.round(
      ((perfPrimary.value - perfComp.value) / perfPrimary.value) * 100,
    );
    insights.push({
      id: "speed-gap",
      type: "ai",
      title: "Concorrente mais rápido",
      description: `Seu concorrente possui páginas ~${pct}% mais rápidas (${perfComp.displayValue} vs ${perfPrimary.displayValue}).`,
      impact: "high",
    });
  }

  const schema = primary.metrics.find((m) => m.id === "schema");
  if (schema && schema.status === "fail") {
    insights.push({
      id: "no-schema",
      type: "opportunity",
      title: "Schema markup ausente",
      description: "Seu site não utiliza schema markup — isso limita rich results no Google.",
      impact: "high",
    });
  }

  const mobile = primary.metrics.find((m) => m.id === "mobile");
  const mobileComp = bestCompetitor?.metrics.find((m) => m.id === "mobile");
  if (
    mobile?.status !== "pass" &&
    mobileComp?.status === "pass"
  ) {
    insights.push({
      id: "mobile-gap",
      type: "warning",
      title: "Mobile inferior ao concorrente",
      description: "O concorrente possui melhor otimização mobile. Priorize Core Web Vitals em dispositivos móveis.",
      impact: "high",
    });
  }

  const metaTitle = primary.metrics.find((m) => m.id === "meta-title");
  if (metaTitle && metaTitle.score < 60) {
    insights.push({
      id: "meta-short",
      type: "opportunity",
      title: "Meta title pode melhorar",
      description: "Seu meta title está curto ou genérico. Teste variações com palavra-chave principal + marca.",
      impact: "medium",
    });
  }

  if (primary.categoryScores.content < 65) {
    insights.push({
      id: "long-tail",
      type: "ai",
      title: "Oportunidade em long-tail",
      description:
        "Existe oportunidade de otimizar palavras-chave long-tail em páginas de suporte e blog.",
      impact: "medium",
    });
  }

  if (primary.overallScore >= (bestCompetitor?.overallScore ?? 0)) {
    insights.push({
      id: "leading",
      type: "win",
      title: "Você lidera o benchmark",
      description: "Seu domínio está à frente dos concorrentes analisados. Mantenha a cadência de otimização.",
      impact: "low",
    });
  }

  return insights.slice(0, 8);
}

/**
 * Recomendações priorizadas por impacto × esforço.
 */
export function generateRecommendations(domains: DomainAnalysis[]): SeoRecommendation[] {
  const primary = domains.find((d) => d.role === "primary");
  if (!primary) return [];

  const recs: SeoRecommendation[] = [];

  const schema = primary.metrics.find((m) => m.id === "schema");
  if (schema?.status !== "pass") {
    recs.push({
      id: "rec-schema",
      title: "Adicionar schema JSON-LD",
      description: "Implemente Organization, WebSite e BreadcrumbList nas páginas principais.",
      impact: "high",
      effort: "low",
      category: "technical",
    });
  }

  const compression = primary.metrics.find((m) => m.id === "compression");
  if (compression && compression.score < 70) {
    recs.push({
      id: "rec-compress",
      title: "Ativar compressão Brotli",
      description: "Configure Brotli no CDN/servidor para reduzir payload e melhorar TTFB.",
      impact: "high",
      effort: "low",
      category: "technical",
    });
  }

  const images = primary.metrics.find((m) => m.id === "page-weight");
  if (images && images.score < 65) {
    recs.push({
      id: "rec-images",
      title: "Comprimir imagens",
      description: "Converta para WebP/AVIF e use lazy-load abaixo da dobra.",
      impact: "high",
      effort: "low",
      category: "performance",
    });
  }

  const ttfb = primary.metrics.find((m) => m.id === "ttfb");
  if (ttfb && ttfb.score < 60) {
    recs.push({
      id: "rec-ttfb",
      title: "Melhorar TTFB",
      description: "Cache de edge, conexão persistente e otimização de banco/API.",
      impact: "high",
      effort: "medium",
      category: "performance",
    });
  }

  const headings = primary.metrics.find((m) => m.id === "headings");
  if (headings && headings.score < 70) {
    recs.push({
      id: "rec-headings",
      title: "Corrigir hierarquia de headings",
      description: "Um H1 por página, H2 para seções e H3 para subseções.",
      impact: "medium",
      effort: "low",
      category: "technical",
    });
  }

  const metaDesc = primary.metrics.find((m) => m.id === "meta-desc");
  if (metaDesc && metaDesc.score < 65) {
    recs.push({
      id: "rec-meta",
      title: "Melhorar meta descriptions",
      description: "Escreva descrições únicas de 140–160 caracteres com CTA sutil.",
      impact: "medium",
      effort: "low",
      category: "content",
    });
  }

  const sortOrder = { high: 0, medium: 1, low: 2 };
  const effortOrder = { low: 0, medium: 1, high: 2 };

  return recs
    .sort(
      (a, b) =>
        sortOrder[a.impact] - sortOrder[b.impact] ||
        effortOrder[a.effort] - effortOrder[b.effort],
    )
    .slice(0, 6);
}

/**
 * Plano SEO de 30 dias (4 semanas).
 */
export function generate30DayPlan(recommendations: SeoRecommendation[]): ThirtyDayPlanItem[] {
  const high = recommendations.filter((r) => r.impact === "high").slice(0, 4);
  const weeks: ThirtyDayPlanItem[] = [
    {
      week: 1,
      focus: "Fundação técnica",
      tasks: high.slice(0, 2).map((r) => r.title) || ["Auditoria técnica completa", "Corrigir erros de indexação"],
    },
    {
      week: 2,
      focus: "Performance e Core Web Vitals",
      tasks: ["Otimizar LCP e INP", "Reduzir peso de página e requests"],
    },
    {
      week: 3,
      focus: "Conteúdo e autoridade",
      tasks: ["Mapa de palavras-chave long-tail", "Atualizar páginas pilares"],
    },
    {
      week: 4,
      focus: "UX e conversão",
      tasks: ["Revisar CTAs e escaneabilidade", "Testes A/B em landing pages"],
    },
  ];
  return weeks;
}

export { CATEGORY_LABELS };
