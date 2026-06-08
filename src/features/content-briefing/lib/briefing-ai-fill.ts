import type { ContentBriefing } from "~/features/content-briefing/types";

/**
 * Preenche briefing com sugestões editoriais baseadas na palavra-chave (local).
 */
export function fillBriefingWithAiSuggestions(
  briefing: ContentBriefing,
): ContentBriefing {
  const kw = briefing.mainKeyword.trim() || "tema principal";
  const project = briefing.projectName.trim() || `Guia sobre ${kw}`;

  return {
    ...briefing,
    updatedAt: new Date().toISOString(),
    projectName: project,
    meta: {
      title: `${kw.charAt(0).toUpperCase() + kw.slice(1)}: guia completo e prático | SEuO`,
      description: `Descubra ${kw} com estratégias de SEO e GEO. Guia informativo, escaneável e otimizado para busca e IA generativa.`,
      suggestedUrl: `/blog/${kw.toLowerCase().replace(/\s+/g, "-")}`,
    },
    strategic: {
      ...briefing.strategic,
      objective: `Educar o público sobre ${kw}, gerar tráfego orgânico qualificado e reforçar autoridade topical.`,
      audience: briefing.strategic.audience || "Profissionais de marketing e conteúdo",
      macroIntent: "informational",
      microIntents: `O que é ${kw}\nComo aplicar ${kw}\nBenefícios de ${kw}\nErros comuns em ${kw}`,
      rationale: `SERP competitiva com conteúdos médios; oportunidade em profundidade semântica e FAQ para snippets.`,
      serpInsights: `Top resultados usam listas, definições diretas e H2 frequentes. Featured snippets favorecem respostas de 40–60 palavras.`,
    },
    geoSeo: {
      primaryKeywords: kw,
      secondaryKeywords: `${kw} estratégia, ${kw} exemplos, ${kw} ferramentas, otimização ${kw}`,
      semanticEntities: `SEO, GEO, conteúdo informativo, search intent, EEAT, LLM, featured snippet`,
      faqTopics: `Perguntas sobre definição, implementação e ROI de ${kw}`,
      peopleAlsoAsk: `O que é ${kw}?\nComo funciona ${kw}?\n${kw} vale a pena?`,
      relatedTerms: `content ops, topical authority, escaneabilidade, AI Overview`,
      semanticIntent: "Informacional com viés educativo e conversão suave",
      geoScore: 78,
      seoScore: 82,
      aiGenerativeTips: `Inclua definição objetiva de ${kw} nos primeiros 100 palavras. Use listas numeradas e blocos FAQ. Cite entidades do nicho sem inventar dados.`,
      llmContextBlocks: `Contexto: ${kw} para equipes de conteúdo B2B.\nEscopo: guia prático, não promocional.\nTom: especialista acessível.`,
      aiOverviewSnippet: `${kw} é uma abordagem estratégica para melhorar visibilidade em buscadores e respostas de IA, combinando SEO tradicional com estrutura semântica para LLMs.`,
    },
    faq: [
      {
        id: crypto.randomUUID(),
        question: `O que é ${kw}?`,
        answer: `${kw} refere-se a práticas que alinham conteúdo informativo à intenção de busca e à forma como modelos de IA recuperam e citam informações.`,
      },
      {
        id: crypto.randomUUID(),
        question: `Como começar com ${kw}?`,
        answer: `Defina palavra-chave principal, estruture H1/H2, inclua FAQ e blocos de resposta direta para mecanismos generativos.`,
      },
    ],
    checklist: {
      ...briefing.checklist,
      faqIncluded: true,
      geoScoreOk: true,
      seoScoreOk: true,
    },
  };
}
