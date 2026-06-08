"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthInput } from "~/app/(auth)/_components/auth-input";
import {
  GitHubGlyph,
  GoogleGlyph,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  UserIcon,
} from "~/app/(auth)/_components/auth-icons";
import { PasswordStrength } from "~/app/(auth)/_components/password-strength";
import { type RegisterFormValues, registerSchema } from "~/app/(auth)/register/register-schema";
import { registerAccount } from "~/app/(auth)/register/register-service";

/**
 * Página de cadastro com validação em tempo real, força de senha e integração com a API.
 */
export function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
    formState: { errors, isValid, isSubmitting, dirtyFields },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  const passwordValue = watch("password");

  useEffect(() => {
    void trigger("confirmPassword");
  }, [passwordValue, trigger]);

  const onSubmit = async (values: RegisterFormValues) => {
    const result = await registerAccount({
      fullName: values.fullName.trim(),
      email: values.email.trim(),
      password: values.password,
    });

    if (!result.ok) {
      if (result.error === "EMAIL_IN_USE") {
        toast.error("Este e-mail já está cadastrado.");
        return;
      }
      if (result.error === "NETWORK") {
        toast.error("Sem conexão. Tente novamente.");
        return;
      }
      if (result.error === "VALIDATION_ERROR") {
        toast.error("Dados inválidos. Revise os campos.");
        return;
      }
      if (result.error === "SERVER_ERROR") {
        toast.error(
          result.message ??
            "Erro no servidor. Reinicie o app (pnpm dev) e confira MONGODB_URI no .env.",
        );
        return;
      }
      toast.error("Não foi possível criar a conta.");
      return;
    }

    toast.success("Conta criada com sucesso!");

    const sign = await signIn("credentials", {
      email: values.email.trim().toLowerCase(),
      password: values.password,
      redirect: false,
      callbackUrl: "/",
    });

    if (sign?.error) {
      toast.message("Conta criada", {
        description: "Faça login com seu e-mail e senha.",
      });
      router.push("/");
      return;
    }

    router.push("/workspace");
    router.refresh();
  };

  return (
    <div className="relative w-full max-w-[440px] px-1">
      <div
        className="pointer-events-none absolute -inset-x-20 -top-32 h-72 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, color-mix(in oklab, var(--color-brand) 35%, transparent) 0%, transparent 65%)",
        }}
        aria-hidden
      />

      <div className="animate-register-enter relative overflow-hidden rounded-2xl border border-white/12 bg-sidebar/55 p-8 shadow-[0_24px_80px_-24px_rgba(0,0,0,0.75)] backdrop-blur-xl ring-1 ring-white/5 sm:p-10">
        <div className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/seuo-logo-icon.svg"
            alt=""
            width={52}
            height={52}
            className="h-[52px] w-[52px]"
            priority
          />
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-[2rem]">
            <span className="drop-shadow-[0_0_28px_color-mix(in_oklab,var(--color-brand)_45%,transparent)]">
              <span className="text-brand-bright">SE</span>
              <span className="text-white">u</span>
              <span className="text-brand-bright">O</span>
            </span>
          </h1>
          <p className="max-w-sm text-sm leading-relaxed text-white/65">
            Crie sua conta e comece em segundos. Experiência segura e alinhada ao
            restante do produto.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <button
              type="button"
              disabled
              title="Disponível em breve"
              aria-label="Cadastrar com Google (em breve)"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 py-3 text-sm font-semibold text-white/50 transition hover:border-white/20 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GoogleGlyph className="shrink-0 opacity-80" />
              Google
            </button>
            <button
              type="button"
              disabled
              title="Disponível em breve"
              aria-label="Cadastrar com GitHub (em breve)"
              className="flex items-center justify-center gap-2 rounded-xl border border-white/12 bg-white/5 py-3 text-sm font-semibold text-white/50 transition hover:border-white/20 hover:bg-white/8 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-60"
            >
              <GitHubGlyph className="h-5 w-5 shrink-0 opacity-80" />
              GitHub
            </button>
          </div>

          <div className="relative flex items-center justify-center py-2">
            <span className="absolute inset-x-0 top-1/2 h-px bg-white/10" aria-hidden />
            <span className="relative bg-sidebar/80 px-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">
              ou com e-mail
            </span>
          </div>
        </div>

        <form
          className="mt-2 flex flex-col gap-5"
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          noValidate
        >
          <AuthInput
            id="register-fullName"
            label="Nome completo"
            autoComplete="name"
            autoFocus
            placeholder="Como devemos te chamar"
            leftIcon={<UserIcon className="h-5 w-5" />}
            error={errors.fullName?.message}
            {...register("fullName")}
          />

          <AuthInput
            id="register-email"
            label="E-mail"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="voce@empresa.com"
            leftIcon={<MailIcon className="h-5 w-5" />}
            error={errors.email?.message}
            {...register("email")}
          />

          <div className="flex flex-col gap-2">
            <AuthInput
              id="register-password"
              label="Senha"
              autoComplete="new-password"
              placeholder="Mínimo 8 caracteres"
              leftIcon={<LockIcon className="h-5 w-5" />}
              error={errors.password?.message}
              {...register("password")}
              type={showPassword ? "text" : "password"}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-5 w-5" />
                  ) : (
                    <EyeIcon className="h-5 w-5" />
                  )}
                </button>
              }
            />
            <PasswordStrength password={passwordValue ?? ""} />
          </div>

          <AuthInput
            id="register-confirmPassword"
            label="Confirmar senha"
            autoComplete="new-password"
            placeholder="Repita a senha"
            leftIcon={<LockIcon className="h-5 w-5" />}
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
            type={showConfirm ? "text" : "password"}
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-brand"
                aria-label={showConfirm ? "Ocultar confirmação de senha" : "Mostrar confirmação de senha"}
                aria-pressed={showConfirm}
              >
                {showConfirm ? (
                  <EyeOffIcon className="h-5 w-5" />
                ) : (
                  <EyeIcon className="h-5 w-5" />
                )}
              </button>
            }
          />

          <Controller
            name="acceptTerms"
            control={control}
            render={({ field }) => (
              <div className="flex flex-col gap-1.5">
                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-transparent px-1 py-1 transition hover:border-white/10 hover:bg-white/[0.04] has-[:focus-visible]:border-brand/40 has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand/25">
                  <input
                    type="checkbox"
                    className="mt-0.5 size-4 shrink-0 rounded border-white/25 bg-black/40 text-brand focus:ring-brand"
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                    aria-invalid={
                      errors.acceptTerms && dirtyFields.acceptTerms ? true : undefined
                    }
                    aria-describedby={
                      errors.acceptTerms && dirtyFields.acceptTerms
                        ? "register-acceptTerms-error"
                        : undefined
                    }
                  />
                  <span className="text-left text-sm leading-snug text-white/75">
                    Li e aceito os{" "}
                    <Link
                      href="/termos"
                      className="font-semibold text-brand-bright underline decoration-brand-bright/40 underline-offset-2 transition hover:decoration-brand-bright"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      termos de uso
                    </Link>
                    .
                  </span>
                </label>
                {errors.acceptTerms && dirtyFields.acceptTerms ? (
                  <p
                    id="register-acceptTerms-error"
                    role="alert"
                    className="text-xs font-medium text-brand-bright"
                  >
                    {errors.acceptTerms.message}
                  </p>
                ) : null}
              </div>
            )}
          />

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="mt-1 w-full rounded-xl border border-brand/45 bg-brand/35 py-3.5 text-sm font-bold text-white shadow-[0_0_32px_-8px_var(--color-brand)] transition hover:bg-brand/50 hover:shadow-[0_0_40px_-6px_var(--color-brand-bright)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-bright disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none"
          >
            {isSubmitting ? "Criando conta…" : "Criar conta"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-white/55">
          Já possui conta?{" "}
          <Link
            href="/login"
            className="font-semibold text-brand-bright underline decoration-brand-bright/35 underline-offset-2 transition hover:text-white hover:decoration-white"
          >
            Entrar
          </Link>
        </p>

        <Link
          href="/"
          className="mt-4 block text-center text-sm font-medium text-white/45 transition hover:text-white/80"
        >
          ← Voltar à página inicial
        </Link>
      </div>
    </div>
  );
}
