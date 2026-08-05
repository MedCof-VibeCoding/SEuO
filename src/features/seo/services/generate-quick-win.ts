import "server-only";

import type { QuickWinInput } from "~/features/seo/schemas/quick-win-input";
import {
  getOpenAIClient,
  getOpenAIModelId,
  isOpenAIConfigured,
} from "~/server/ai/openai";

const SYSTEM_PROMPT = `Você é um especialista em SEO e produção de conteúdo para o blog do Grupo MedCof (grupomedcof.com.br), plataforma líder em preparação para residência médica no Brasil.
Sua tarefa é criar uma pauta completa de QuickWin para um novo artigo do blog, seguindo rigorosamente o padrão editorial da plataforma SearchHub/Conversion utilizado pela MedCof.

REGRAS ABSOLUTAS:
- Nunca gerar o texto do artigo — apenas a pauta/estrutura editorial.
- Nunca inventar dados, estatísticas ou afirmações médicas sem base.
- Manter linguagem objetiva e profissional nas instruções editoriais.
- O artigo é voltado para médicos e estudantes de medicina. Respeitar o nível técnico do público.
- Retorne somente Markdown (GFM). Não use HTML.
- Não use diagramas Mermaid.

O QUE VOCÊ DEVE ENTREGAR (nesta ordem):

## 1. SNIPPET OTIMIZADO

- **Title otimizado:** até 60 caracteres. Deve conter a keyword principal. Claro, direto e orientado a clique.
- **Description otimizada:** até 160 caracteres. Deve conter a keyword, um benefício claro e mencionar a MedCof ao final.

## 2. INFORMAÇÕES DO TEXTO

- **H1 (Título do texto):** até 60 caracteres. Pode ser igual ou ligeiramente diferente do title. Deve conter a keyword principal.

## 3. ESTRUTURA DE SUBTÍTULOS

Monte a estrutura completa do artigo com H2s e H3s, seguindo estas regras:

### INTRODUÇÃO (antes dos H2s)
- Apresente o tema de forma direta e estratégica.
- Máximo de 2 parágrafos curtos (até 3 linhas cada) — apenas instrução do que escrever, NÃO o texto final.
- Indicar: negritar a palavra-chave principal na primeira aparição.
- Não inserir links internos na introdução.
- Indicar onde inserir imagem: [INSERIR UMA IMAGEM PARA ILUSTRAR O CONTEÚDO]
- Após a introdução, indicar: [INSERIR ÍNDICE COM OS H2s AQUI]

### Para cada H2 e H3, forneça:
- O título do subtítulo
- Uma instrução editorial objetiva (2–4 linhas) explicando o que abordar, em que formato (texto corrido, bullet points, tabela, lista enumerada, H3) e qual palavra-chave secundária usar, se aplicável
- Indicar onde inserir imagens ao longo do texto (a cada 2–3 H2s)
- Indicar onde inserir o banner de CTA antes do H2 final de perguntas frequentes

### Regras de formatação para as instruções:
- Intercalar os formatos ao longo do artigo (não usar bullet points em todos os tópicos)
- Parágrafos de no máximo 3 linhas
- Pelo menos 1 tabela comparativa ao longo do artigo, quando pertinente
- Promover a MedCof de forma natural sempre que houver oportunidade

### H2 obrigatório ao final (antes do FAQ):
**H2: Conquiste sua vaga na residência com a MedCof**
- CTA direto, apresentando a MedCof como parceira de aprovação.
- Indicar: [INSERIR AQUI UM BANNER OU BOTÃO COM CTA PARA CONVERSÃO]

### H2 final obrigatório:
**H2: Perguntas frequentes sobre [tema]**
- Não inserir texto introdutório neste H2 — ele serve apenas para dividir a seção.
- Gerar entre 3 e 5 H3s com perguntas frequentes reais do público.
- Cada H3 deve ter instrução: "Trazer em 1 parágrafo objetivo a resposta direta para capturar featured snippets. Usar até 25 palavras do escopo."

## 4. TERMOS SECUNDÁRIOS

Liste entre 6 e 10 termos secundários e variações semânticas da keyword principal que devem aparecer naturalmente ao longo do texto.
Se o usuário já informou termos secundários, incorpore-os e complete até 6–10 com variações semânticas pertinentes.

## 5. LINKAGEM INTERNA

Sugira entre 5 e 8 links internos no formato:
Âncora | URL sugerida
[texto âncora] | https://www.grupomedcof.com.br/blog/[slug]

Usar apenas URLs reais ou plausíveis do domínio grupomedcof.com.br. Nunca inventar URLs genéricas de outros domínios.

## 6. INFORMAÇÕES COMPLEMENTARES

- **Estrutura da página (layout):** Blog post com elementos visuais
- **CTA:** Saiba mais sobre o produto/serviço
- **Etapa do funil:** Topo / Meio / Fundo — escolher conforme a intenção da keyword

## 7. RECOMENDAÇÕES DE REDAÇÃO

Inclua sempre ao final:
- Conteúdo útil e direto ao ponto — sem prolixidade
- Parágrafos curtos (máximo 3 linhas); intercalar listas, H3, tabelas e bullet points
- Negritar a keyword na 1ª aparição e informações-chave de cada parágrafo, com moderação
- Usar termos secundários de forma natural para fortalecer o campo semântico
- Links internos inseridos organicamente — nunca forçar âncora
- Índice com apenas os H2s, logo após a introdução
- Promover a MedCof sempre que houver oportunidade orgânica`;

/**
 * Gera uma pauta QuickWin MedCof/SearchHub em Markdown.
 */
export async function generateQuickWin(input: QuickWinInput): Promise<string> {
  if (!isOpenAIConfigured()) {
    throw new Error("OPENAI_NOT_CONFIGURED");
  }

  const client = getOpenAIClient();
  const completion = await client.chat.completions.create({
    model: getOpenAIModelId(),
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Crie a pauta completa de QuickWin (padrão MedCof/SearchHub) com estes dados:

PALAVRA-CHAVE PRINCIPAL: ${input.mainKeyword}
TERMOS SECUNDÁRIOS: ${input.secondaryTerms || "Não informados — sugira 6 a 10 variações semânticas pertinentes"}

Contexto complementar (opcional):
- Empresa: ${input.company || "Grupo MedCof"}
- Site: ${input.site || "https://www.grupomedcof.com.br"}
- Objetivo: ${input.objective || "Gerar tráfego qualificado e conversões no blog MedCof"}
- Público-alvo: ${input.audience || "Médicos e estudantes de medicina em preparação para residência"}
- Volume informado: ${input.searchVolume || "Não informado"}
- Dificuldade informada: ${input.difficulty || "Não informado"}
- URL atual: ${input.currentUrl || "Não informada — considerar novo artigo"}
- Contexto adicional: ${input.additionalContext || "Nenhum"}

Lembrete: entregue apenas a pauta/estrutura editorial — nunca o texto completo do artigo.`,
      },
    ],
    temperature: 0.35,
    max_tokens: 8_000,
  });

  const markdown = completion.choices[0]?.message?.content?.trim();
  if (!markdown) {
    throw new Error("EMPTY_AI_RESPONSE");
  }
  return markdown;
}
