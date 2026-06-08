import { z } from "zod";

export const optimizeTextSchema = z.object({
  text: z.string().min(80, "Mínimo 80 caracteres").max(12000),
  mode: z.enum(["balanced", "seo_max", "conversion", "authority"]).default("balanced"),
  tone: z.enum(["neutral", "professional", "friendly", "authoritative"]).default("neutral"),
  searchIntent: z
    .enum(["informational", "commercial", "transactional", "navigational"])
    .default("informational"),
  targetKeyword: z.string().max(120).optional(),
  featuredSnippet: z.boolean().default(false),
  generateFaqs: z.boolean().default(false),
  eeatFocus: z.boolean().default(false),
});

export type OptimizeTextInput = z.infer<typeof optimizeTextSchema>;
