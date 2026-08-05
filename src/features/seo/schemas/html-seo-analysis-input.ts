import { z } from "zod";

function normalizeUrlInput(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function isValidUrl(v: string): boolean {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export const analyzeHtmlSchema = z.object({
  html: z
    .string()
    .min(1, "Informe o HTML do conteúdo.")
    .max(2_000_000, "HTML muito grande (máx. 2MB)."),
  url: z
    .string()
    .min(1, "Informe a URL da página para consultar o Search Console.")
    .max(2048)
    .transform(normalizeUrlInput)
    .refine(isValidUrl, "URL inválida."),
  mainKeyword: z
    .string()
    .max(120)
    .default("")
    .transform((v) => v.trim() || undefined),
});

export type AnalyzeHtmlInput = z.infer<typeof analyzeHtmlSchema>;
