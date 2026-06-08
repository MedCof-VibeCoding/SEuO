import "server-only";

import { isOpenAIConfigured, getOpenAIClient } from "~/server/ai/openai";
import type { SeoAnalysisReport } from "~/features/seo/types/analysis";

/**
 * Fallback OpenAI para relatórios legados sem análise Gemini editorial.
 */
export async function enrichReportWithOpenAINarrative(
  report: SeoAnalysisReport,
): Promise<string | undefined> {
  if (!isOpenAIConfigured()) return undefined;

  const primary = report.domains.find((d) => d.role === "primary");
  if (!primary) return undefined;

  const prompt = `Você é consultor SEO sênior. Domínio: ${primary.domain}. Score SEO: ${primary.overallScore}/100.
Escreva 3 parágrafos em português: diagnóstico, comparação com concorrentes, plano de ação. Tom profissional.`;

  try {
    const client = getOpenAIClient();
    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 600,
      temperature: 0.6,
    });
    return completion.choices[0]?.message?.content?.trim();
  } catch {
    return undefined;
  }
}
