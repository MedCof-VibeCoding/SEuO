import type { ContentBriefing } from "~/features/content-briefing/types";

const now = new Date().toISOString();

/**
 * Briefing editorial vazio com estrutura padrão GEO + SEO.
 */
export function createDefaultBriefing(): ContentBriefing {
  return {
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
    projectName: "Novo briefing de conteúdo",
    mainKeyword: "",
    status: "draft",
    owner: "",
    meta: {
      title: "",
      description: "",
      suggestedUrl: "",
    },
    strategic: {
      objective: "",
      contentType: "blog_post",
      funnelStage: "awareness",
      audience: "",
      macroIntent: "informational",
      microIntents: "",
      rationale: "",
      serpInsights: "",
    },
    geoSeo: {
      primaryKeywords: "",
      secondaryKeywords: "",
      semanticEntities: "",
      faqTopics: "",
      peopleAlsoAsk: "",
      relatedTerms: "",
      semanticIntent: "",
      geoScore: 42,
      seoScore: 38,
      aiGenerativeTips: "",
      llmContextBlocks: "",
      aiOverviewSnippet: "",
    },
    structure: {
      blocks: [
        { id: "b1", type: "h1", title: "Título principal (H1)", notes: "", checked: false },
        { id: "b2", type: "intro", title: "Introdução", notes: "Gancho + promessa + palavra-chave", checked: false },
        { id: "b3", type: "h2", title: "Seção 1", notes: "", checked: false },
        { id: "b4", type: "h2", title: "Seção 2", notes: "", checked: false },
        { id: "b5", type: "faq", title: "FAQ", notes: "Perguntas para snippet e IA", checked: false },
        { id: "b6", type: "cta", title: "CTA final", notes: "", checked: false },
      ],
    },
    guidelines: {
      tone: "Profissional, claro e consultivo. Evitar jargão sem contexto.",
      scannability: "Parágrafos curtos, listas, subtítulos a cada 200–300 palavras.",
      maxLinesPerParagraph: 4,
      boldRules: "Destacar termos-chave e benefícios; máximo 1 negrito por parágrafo.",
      internalLinking: "2–4 links internos contextuais por 1.000 palavras.",
      uxWriting: "Verbos de ação, benefício antes do recurso, microcopy objetivo.",
      mobile: "Frases curtas; CTAs visíveis sem scroll excessivo.",
      generativeAi: "Respostas diretas no início de seções; listas e definições claras.",
    },
    internalLinks: [],
    visuals: {
      imageSuggestions: "",
      bannerCta: "",
      highlightBlocks: "",
      infographics: "",
      assets: [],
    },
    production: { body: "" },
    faq: [],
    checklist: {
      keywordInH1: false,
      keywordInIntro: false,
      faqIncluded: false,
      internalLinksAdded: false,
      scannabilityOk: false,
      geoScoreOk: false,
      seoScoreOk: false,
      ctaIncluded: false,
      mobileFriendly: false,
    },
    comments: [],
    versions: [],
  };
}

export const CHECKLIST_ITEMS: { key: string; label: string }[] = [
  { key: "keywordInH1", label: "Palavra-chave no H1" },
  { key: "keywordInIntro", label: "Palavra-chave na introdução" },
  { key: "faqIncluded", label: "FAQ incluído" },
  { key: "internalLinksAdded", label: "Links internos adicionados" },
  { key: "scannabilityOk", label: "Escaneabilidade validada" },
  { key: "geoScoreOk", label: "GEO score aprovado" },
  { key: "seoScoreOk", label: "SEO score aprovado" },
  { key: "ctaIncluded", label: "CTA incluído" },
  { key: "mobileFriendly", label: "Mobile friendly" },
];

export const SECTION_NAV = [
  { id: "meta", label: "Meta tags", icon: "◇" },
  { id: "strategic", label: "Objetivo", icon: "◎" },
  { id: "geo-seo", label: "GEO + SEO", icon: "✦" },
  { id: "structure", label: "Estrutura", icon: "≡" },
  { id: "guidelines", label: "Diretrizes", icon: "✎" },
  { id: "links", label: "Links internos", icon: "↗" },
  { id: "visuals", label: "Visuais", icon: "▣" },
  { id: "production", label: "Produção", icon: "¶" },
  { id: "faq", label: "FAQ", icon: "?" },
  { id: "checklist", label: "Checklist", icon: "✓" },
] as const;
