/** Contexto base injetado em todos os prompts. */
export const COMPARATIVE_CONTEXT_PREFIX = `Compare o artigo-alvo com os concorrentes usando apenas os dados coletados (HTML/on-page). Seja específico e conciso.`;

export const PROMPT_KEYWORDS = `${COMPARATIVE_CONTEXT_PREFIX}

Analise apenas palavras-chave.

Retorne JSON:
{
  "top_keywords": [],
  "keyword_gaps": [],
  "quick_wins": [],
  "long_tail_opportunities": []
}

Máximo 10 itens por lista. Cada lista deve conter apenas strings (não objetos).
Responda SOMENTE com o objeto JSON, sem markdown, sem texto antes ou depois.`;

export const PROMPT_BACKLINKS = `${COMPARATIVE_CONTEXT_PREFIX}

Analise apenas backlinks e autoridade de domínio (estimativas a partir dos dados disponíveis).

Retorne JSON:
{
  "authority_comparison": {},
  "link_gaps": [],
  "replicable_patterns": [],
  "top_link_opportunities": []
}

Máximo 10 oportunidades em listas. authority_comparison: objeto com domínio/URL e nota curta. Apenas JSON válido.`;

export const PROMPT_CONTENT = `${COMPARATIVE_CONTEXT_PREFIX}

Analise apenas conteúdo e SEO on-page. Use SEMPRE termos em português nas chaves dos objetos.

Retorne JSON:
{
  "content_patterns": {
    "Foco do texto": "",
    "Foco dos concorrentes": "",
    "Uso do FAQ": ""
  },
  "on_page_patterns": {},
  "content_opportunities": []
}

content_patterns: use EXATAMENTE as três chaves acima (texto curto em cada valor).
on_page_patterns: chaves em português (ex.: "Integração das palavras-chaves", "Especificidades de nicho", "Estrutura de títulos (H1–H3)", "Meta descrição"). Não use snake_case em inglês.
Máximo 10 content_opportunities (strings objetivas). Apenas JSON válido, sem markdown.`;

export const PROMPT_ACTION_PLAN = `Com base nos resultados das análises anteriores (keywords, backlinks, conteúdo) e nos dados das páginas, retorne apenas o plano de ação.

Retorne JSON:
{
  "short_term": [],
  "medium_term": [],
  "long_term": []
}

Máximo 3 ações por período (strings objetivas). Apenas JSON válido, sem markdown.`;
