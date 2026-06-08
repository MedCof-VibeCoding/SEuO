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
    .min(2, "Informe a palavra-chave (mín. 2 caracteres).")
    .max(120, "Palavra-chave muito longa."),
});

export type GooglePositionCheckFormValues = z.infer<typeof googlePositionCheckSchema>;
