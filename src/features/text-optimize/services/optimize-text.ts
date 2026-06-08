import "server-only";

import { z } from "zod";

import type { OptimizeTextInput } from "~/features/text-optimize/schemas/optimize-input";
import {
  analyzeTextMetrics,
  boostMetricsAfter,
} from "~/features/text-optimize/services/text-metrics";
import type { TextOptimizeResult } from "~/features/text-optimize/types";
import { isOpenAIConfigured, getOpenAIClient } from "~/server/ai/openai";

const aiResponseSchema = z.object({
  optimizedText: z.string(),
  targetKeyword: z.string().optional(),
  changes: z.array(
    z.object({
      category: z.enum([
        "legibilidade",
        "seo",
        "ctr",
        "estrutura",
        "conversao",
        "autoridade",
      ]),
      title: z.string(),
      description: z.string(),
    }),
  ),
  diffNotes: z.array(
    z.object({
      snippet: z.string(),
      reason: z.string(),
    }),
  ),
  faqs: z.array(z.string()).optional(),
});

const MODE_INSTRUCTIONS: Record<OptimizeTextInput["mode"], string> = {
  balanced:
    "Equilíbrio entre SEO, legibilidade e conversão. Mudanças moderadas e conservadoras.",
  seo_max:
    "Priorize cobertura semântica, entidades relacionadas e estrutura on-page sem alterar fatos.",
  conversion:
    "Priorize clareza de CTA, fluxo persuasivo e escaneabilidade sem exagerar promessas.",
  authority:
    "Priorize sinais E-E-A-T: precisão, credibilidade, profundidade e linguagem de especialista.",
};

/**
 * Otimização local conservadora quando OpenAI não está disponível.
 */
function optimizeTextOffline(
  text: string,
  input: OptimizeTextInput,
): Omit<TextOptimizeResult, "metricsBefore" | "metricsAfter" | "aiPowered"> {
  const lines = text.split("\n");
  const optimizedLines: string[] = [];
  const changes: TextOptimizeResult["changes"] = [];

  for (const line of lines) {
    if (line.length > 140 && !line.startsWith("#")) {
      const parts = line.split(/(?<=[.!?])\s+/);
      if (parts.length > 1) {
        optimizedLines.push(...parts);
        changes.push({
          category: "legibilidade",
          title: "Frases divididas",
          description:
            "Frases muito longas foram divididas para melhorar escaneabilidade.",
        });
        continue;
      }
    }
    optimizedLines.push(line);
  }

  let optimized = optimizedLines.join("\n");
  const hasHeading = /^#{1,3}\s/m.test(optimized);
  if (!hasHeading && optimized.length > 200) {
    const firstSentence = optimized.split(/[.!?]/)[0]?.trim() ?? "Conteúdo";
    optimized = `## ${firstSentence.slice(0, 72)}\n\n${optimized}`;
    changes.push({
      category: "estrutura",
      title: "Hierarquia de headings",
      description:
        "Subtítulo adicionado no topo para melhorar hierarquia semântica (H2).",
    });
  }

  if (input.generateFaqs && !optimized.includes("## Perguntas frequentes")) {
    optimized += `\n\n## Perguntas frequentes\n\n### O que é abordado neste conteúdo?\nResumo alinhado ao texto original, sem informações novas.\n`;
    changes.push({
      category: "seo",
      title: "Bloco FAQ",
      description: "Estrutura FAQ sugerida para rich results e AI search.",
    });
  }

  return {
    optimizedText: optimized.trim(),
    targetKeyword: input.targetKeyword,
    changes: dedupeChanges(changes),
    diffNotes: [
      {
        snippet: "Estrutura e frases",
        reason: "Refino editorial conservador preservando significado original.",
      },
    ],
    faqs: input.generateFaqs
      ? ["O que é abordado neste conteúdo?", "Como aplicar estas informações?"]
      : [],
    mode: input.mode,
  };
}

function dedupeChanges(
  changes: TextOptimizeResult["changes"],
): TextOptimizeResult["changes"] {
  const seen = new Set<string>();
  return changes.filter((c) => {
    const key = `${c.category}:${c.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Otimiza texto com OpenAI respeitando significado e intenção originais.
 */
export async function optimizeText(
  input: OptimizeTextInput,
): Promise<TextOptimizeResult> {
  const text = input.text.trim();
  const metricsBefore = analyzeTextMetrics(text, input.targetKeyword);

  if (!isOpenAIConfigured()) {
    const offline = optimizeTextOffline(text, input);
    const metricsAfter = boostMetricsAfter(
      metricsBefore,
      offline.optimizedText,
      input.targetKeyword,
    );
    return {
      ...offline,
      metricsBefore,
      metricsAfter,
      aiPowered: false,
    };
  }

  const system = `Você é editor SEO sênior e copiloto de conteúdo orgânico.
REGRAS INVIOLÁVEIS:
- Preserve o significado, contexto, intenção, promessa e tom originais.
- NÃO invente fatos, números, depoimentos ou claims novos.
- NÃO mude o posicionamento da marca.
- Apenas refine, estruture, melhore clareza e enriqueça semanticamente.
- Pode ajustar headings (markdown), dividir frases longas, melhorar distribuição de palavras-chave e CTAs.
- Responda APENAS JSON válido no schema solicitado.`;

  const userPrompt = `Modo: ${input.mode} — ${MODE_INSTRUCTIONS[input.mode]}
Tom: ${input.tone}
Intenção de busca: ${input.searchIntent}
${input.targetKeyword ? `Palavra-chave principal: ${input.targetKeyword}` : ""}
${input.featuredSnippet ? "Otimize também para featured snippet (resposta direta no início)." : ""}
${input.eeatFocus ? "Reforce sinais E-E-A-T sem inventar credenciais." : ""}
${input.generateFaqs ? "Inclua seção ## Perguntas frequentes com 2-3 FAQs baseadas APENAS no texto." : ""}

TEXTO ORIGINAL:
---
${text}
---

Retorne JSON:
{
  "optimizedText": "markdown otimizado",
  "targetKeyword": "opcional",
  "changes": [{"category":"legibilidade|seo|ctr|estrutura|conversao|autoridade","title":"","description":""}],
  "diffNotes": [{"snippet":"trecho","reason":"motivo"}],
  "faqs": ["pergunta1", ...]
}`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.35,
      max_tokens: 4000,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const parsed = aiResponseSchema.safeParse(JSON.parse(raw) as unknown);
    if (!parsed.success) {
      throw new Error("invalid_ai_response");
    }

    const data = parsed.data;
    const metricsAfter = boostMetricsAfter(
      metricsBefore,
      data.optimizedText,
      data.targetKeyword ?? input.targetKeyword,
    );

    return {
      optimizedText: data.optimizedText.trim(),
      targetKeyword: data.targetKeyword ?? input.targetKeyword,
      changes: dedupeChanges(data.changes),
      diffNotes: data.diffNotes.slice(0, 12),
      faqs: data.faqs ?? [],
      mode: input.mode,
      metricsBefore,
      metricsAfter,
      aiPowered: true,
    };
  } catch {
    const offline = optimizeTextOffline(text, input);
    const metricsAfter = boostMetricsAfter(
      metricsBefore,
      offline.optimizedText,
      input.targetKeyword,
    );
    return {
      ...offline,
      metricsBefore,
      metricsAfter,
      aiPowered: false,
    };
  }
}
