import { z } from "zod";

function isValidUrlInput(val: string): boolean {
  const trimmed = val.trim();
  if (!trimmed) return false;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    new URL(withProto);
    return true;
  } catch {
    return false;
  }
}

export const googlePositionCheckSchema = z.object({
  url: z
    .string()
    .min(1, "Informe a URL da página.")
    .max(2048)
    .refine(isValidUrlInput, { message: "URL inválida. Ex.: https://seusite.com.br/pagina" }),
  keyword: z
    .string()
    .max(120, "Palavra-chave muito longa.")
    .refine((v) => v.trim().length === 0 || v.trim().length >= 2, {
      message: "Palavra-chave deve ter ao menos 2 caracteres.",
    }),
});

export type GooglePositionCheckFormValues = z.infer<typeof googlePositionCheckSchema>;
