/** Contexto base injetado em todos os prompts. */
export const COMPARATIVE_CONTEXT_PREFIX = `Você é especialista em SEO técnico, conteúdo, UX, CRO e marketing digital.
Compare o artigo-alvo com os concorrentes usando SOMENTE os dados coletados no contexto (HTML/on-page e, se houver, Search Console).
Regras de evidência:
- Analise apenas o que está nos dados fornecidos.
- Não invente volume, KD, CPC, backlinks, DR, DA, Core Web Vitals, PageSpeed, indexação ou rankings de concorrentes.
- Não mencione ferramentas externas nem diga que algo "requer integração".
- Se um tema não puder ser avaliado com o HTML, omita-o em vez de especular.
- Seja específico, acionável e conciso.`;

export const PROMPT_KEYWORDS = `${COMPARATIVE_CONTEXT_PREFIX}

Analise intenção de busca, público provável, palavras-chave e entidades observadas no texto,
perguntas respondidas, lacunas temáticas e oportunidades editoriais para Featured Snippets / AI Overview
com base apenas no conteúdo coletado.

Retorne JSON:
{
  "top_keywords": [],
  "keyword_gaps": [],
  "quick_wins": [],
  "long_tail_opportunities": []
}

Máximo 10 itens por lista. Cada string deve citar evidência do HTML.
quick_wins: oportunidades editoriais de baixo esforço.
long_tail_opportunities: perguntas e termos específicos presentes ou claramente ausentes no texto.
Responda SOMENTE com o objeto JSON, sem markdown, sem texto antes ou depois.`;

export const PROMPT_CONTENT = `${COMPARATIVE_CONTEXT_PREFIX}

Faça uma auditoria comparativa de conteúdo, SEO on-page, UX e CRO.
Use SEMPRE termos em português nas chaves dos objetos.

Retorne JSON:
{
  "content_patterns": {},
  "on_page_patterns": {},
  "content_opportunities": []
}

content_patterns: inclua estas chaves, com comparação curta e baseada em evidência:
"Intenção de busca", "Público-alvo", "Profundidade", "Arquitetura do conteúdo",
"Cobertura de tópicos", "Entidades semânticas", "Perguntas respondidas", "FAQ",
"CTA e conversão", "EEAT", "Imagens e mídia", "Tabelas e listas",
"Featured Snippets", "AI Overview", "Pontos fortes", "Pontos fracos", "Gaps de conteúdo",
"SWOT — Forças", "SWOT — Fraquezas", "SWOT — Oportunidades" e "SWOT — Ameaças".
on_page_patterns: inclua "Title e meta description", "Estrutura H1/H2/H3", "Canonical e robots",
"Schema Markup", "Links internos", "Links externos", "Acessibilidade de imagens" e "Idioma".
Não avalie velocidade, Core Web Vitals, sitemap, indexação, backlinks ou autoridade de domínio.
Não use snake_case em inglês.
Máximo 10 content_opportunities (strings objetivas). Apenas JSON válido, sem markdown.`;

export const PROMPT_ACTION_PLAN = `${COMPARATIVE_CONTEXT_PREFIX}

Com base nas análises anteriores e nos dados das páginas, retorne apenas o plano de ação.
Cada ação deve seguir o formato:
"[🔴 Crítico|🟠 Importante|🟡 Recomendado|🟢 Opcional] Ação — Impacto: alto|médio|baixo; Esforço: alto|médio|baixo; Prazo: ...; KPI: ..."
Priorize clareza editorial, EEAT, UX, conversão e SEO on-page verificável no HTML.
Não inclua ações de link building, PageSpeed, CWV ou compra de ferramentas externas.

Retorne JSON:
{
  "short_term": [],
  "medium_term": [],
  "long_term": []
}

Máximo 5 ações por período. Apenas JSON válido, sem markdown.`;
