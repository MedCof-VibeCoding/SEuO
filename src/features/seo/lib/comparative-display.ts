import type {
  ComparativeArticleReport,
  ContentStepResult,
  KeywordsStepResult,
  SeoInsight,
} from "~/features/seo/types/analysis";

const CONTENT_PATTERN_KEYS = [
  "Foco do texto",
  "Foco dos concorrentes",
  "Uso do FAQ",
] as const;

const CONTENT_PATTERN_ALIASES: Record<string, string> = {
  target_focus: "Foco do texto",
  foco_do_texto: "Foco do texto",
  competitor_focus: "Foco dos concorrentes",
  foco_dos_concorrentes: "Foco dos concorrentes",
  faq_usage: "Uso do FAQ",
  uso_do_faq: "Uso do FAQ",
  uso_faq: "Uso do FAQ",
};

const ON_PAGE_LABELS: Record<string, string> = {
  keyword_integration: "Integração das palavras-chaves",
  niche_specificity: "Especificidades de nicho",
  title_structure: "Estrutura de títulos (H1–H3)",
  meta_description: "Meta descrição",
  internal_linking: "Links internos",
  schema_markup: "Dados estruturados (schema)",
  image_optimization: "Otimização de imagens",
  url_structure: "Estrutura de URL",
  heading_hierarchy: "Hierarquia de headings",
  content_depth: "Profundidade do conteúdo",
};

/**
 * Normaliza chave de padrão de conteúdo para o rótulo em português.
 */
export function normalizeContentPatternKey(key: string): string {
  return CONTENT_PATTERN_ALIASES[key] ?? key.replace(/_/g, " ");
}

/**
 * Normaliza chave on-page para rótulo legível em português.
 */
export function normalizeOnPagePatternKey(key: string): string {
  if (ON_PAGE_LABELS[key]) return ON_PAGE_LABELS[key];
  if (/[áàâãéêíóôõúç]/i.test(key)) return key;
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Extrai os três padrões de conteúdo na ordem esperada.
 */
export function getContentPatterns(
  patterns: ContentStepResult["content_patterns"],
): { label: string; value: string }[] {
  const normalized = new Map<string, string>();
  for (const [key, value] of Object.entries(patterns)) {
    normalized.set(normalizeContentPatternKey(key), value);
  }

  return CONTENT_PATTERN_KEYS.map((label) => ({
    label,
    value: normalized.get(label) ?? "—",
  }));
}

/**
 * Lista padrões on-page com rótulos em português.
 */
export function getOnPagePatterns(
  patterns: ContentStepResult["on_page_patterns"],
): { label: string; value: string }[] {
  return Object.entries(patterns).map(([key, value]) => ({
    label: normalizeOnPagePatternKey(key),
    value,
  }));
}

/**
 * Limita listas de keywords conforme layout do relatório.
 */
export function sliceKeywords(keywords: KeywordsStepResult) {
  return {
    top: keywords.top_keywords.slice(0, 3),
    gaps: keywords.keyword_gaps.slice(0, 6),
    quickWins: keywords.quick_wins,
    longTail: keywords.long_tail_opportunities.slice(0, 6),
  };
}

/**
 * Insights inteligentes: quick wins + oportunidades de conteúdo.
 */
export function buildComparativeInsights(article: ComparativeArticleReport): SeoInsight[] {
  const quickWins = article.keywords.quick_wins.slice(0, 4).map((title, i) => ({
    id: `qw-${i}`,
    type: "win" as const,
    title,
    description: "Sugestão de quick win para melhorar o ranqueamento.",
    impact: "high" as const,
  }));

  const contentOps = article.content.content_opportunities.slice(0, 4).map((title, i) => ({
    id: `co-${i}`,
    type: "opportunity" as const,
    title,
    description: "Oportunidade de conteúdo para melhorar o artigo analisado.",
    impact: "medium" as const,
  }));

  return [...quickWins, ...contentOps];
}

/**
 * Texto enxuto sobre diferenciais SEO dos concorrentes.
 */
export function buildCompetitorSeoNarrative(article: ComparativeArticleReport): string {
  const { content, keywords } = article;
  const focoConcorrentes =
    content.content_patterns["Foco dos concorrentes"] ??
    Object.entries(content.content_patterns).find(([k]) =>
      k.toLowerCase().includes("concorrent"),
    )?.[1];

  const onPageHighlights = getOnPagePatterns(content.on_page_patterns)
    .slice(0, 2)
    .map((p) => `${p.label}: ${p.value}`)
    .join(" ");

  const parts = [
    focoConcorrentes,
    keywords.top_keywords.length
      ? `Eles reforçam palavras-chave como ${keywords.top_keywords.slice(0, 3).join(", ")}.`
      : null,
    onPageHighlights,
  ].filter(Boolean);

  if (parts.length === 0) {
    return "Os concorrentes tendem a performar melhor por combinar palavras-chave bem integradas ao texto, estrutura on-page clara (títulos, meta e FAQ) e conteúdo mais alinhado à intenção de busca do usuário.";
  }

  return parts.join(" ");
}
