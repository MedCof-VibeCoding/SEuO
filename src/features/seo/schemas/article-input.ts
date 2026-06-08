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

const urlField = z
  .string()
  .min(1, "Informe a URL.")
  .max(2048)
  .transform(normalizeUrlInput)
  .refine(isValidUrl, "URL inválida.");

const optionalUrlField = z
  .string()
  .max(2048)
  .transform((v) => {
    const t = v.trim();
    if (!t) return undefined;
    return normalizeUrlInput(t);
  })
  .refine((v) => v === undefined || isValidUrl(v), "URL inválida.");

const optionalText = z
  .string()
  .max(300)
  .transform((v) => v.trim() || undefined);

export const analyzeArticlesSchema = z
  .object({
    targetUrl: urlField,
    competitor1: urlField,
    competitor2: optionalUrlField,
    mainKeyword: optionalText,
  })
  .superRefine((data, ctx) => {
    const urls = [data.targetUrl, data.competitor1, data.competitor2].filter(
      Boolean,
    ) as string[];

    const keys = urls.map((u) => {
      try {
        const parsed = new URL(u);
        return `${parsed.origin}${parsed.pathname}`.toLowerCase();
      } catch {
        return u.toLowerCase();
      }
    });

    if (new Set(keys).size !== keys.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "As URLs devem ser diferentes entre si.",
        path: ["competitor1"],
      });
    }
  });

export type AnalyzeArticlesFormValues = z.infer<typeof analyzeArticlesSchema>;
export type AnalyzeArticlesFormInput = z.input<typeof analyzeArticlesSchema>;

/** @deprecated use analyzeArticlesSchema */
export const analyzeDomainsSchema = analyzeArticlesSchema;

/** @deprecated */
export type AnalyzeDomainsFormValues = AnalyzeArticlesFormValues;
