import { z } from "zod";

export const registerSchema = z
  .object({
    fullName: z
      .string({ required_error: "Informe seu nome completo." })
      .min(2, "Nome muito curto.")
      .max(120, "Nome muito longo."),
    email: z
      .string({ required_error: "Informe seu e-mail." })
      .email("E-mail inválido.")
      .max(320, "E-mail muito longo."),
    password: z
      .string({ required_error: "Crie uma senha." })
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
      .max(128, "Senha muito longa."),
    confirmPassword: z.string({ required_error: "Confirme a senha." }),
    acceptTerms: z.boolean(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  })
  .superRefine((data, ctx) => {
    if (!data.acceptTerms) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["acceptTerms"],
        message: "Você precisa aceitar os termos de uso.",
      });
    }
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
