import { z } from "zod";

export const quickWinInputSchema = z.object({
  mainKeyword: z.string().trim().min(2, "Informe a palavra-chave.").max(120),
  secondaryTerms: z.string().trim().max(800).optional(),
  company: z.string().trim().max(120).optional(),
  site: z
    .union([
      z.string().trim().url("Informe uma URL válida.").max(2048),
      z.literal(""),
    ])
    .optional(),
  objective: z.string().trim().max(300).optional(),
  audience: z.string().trim().max(300).optional(),
  searchVolume: z.string().trim().max(80).optional(),
  difficulty: z.string().trim().max(80).optional(),
  currentUrl: z
    .union([
      z.string().trim().url("Informe uma URL válida.").max(2048),
      z.literal(""),
    ])
    .optional(),
  additionalContext: z.string().trim().max(3000).optional(),
});

export type QuickWinInput = z.infer<typeof quickWinInputSchema>;
