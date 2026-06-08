"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { AuthInput } from "~/app/(auth)/_components/auth-input";
import { EyeIcon, EyeOffIcon, GoogleGlyph, LockIcon, MailIcon } from "~/app/(auth)/_components/auth-icons";
import {
  loginSchema,
  REMEMBER_EMAIL_KEY,
  type LoginFormValues,
} from "~/app/(auth)/login/login-schema";
import { redirectToGoogleSignIn } from "~/features/auth/google-sign-in";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  Signin: "Não foi possível iniciar o login.",
  CredentialsSignin: "E-mail ou senha incorretos.",
  SessionRequired: "Sua sessão expirou. Entre novamente.",
  OAuthSignin: "Erro ao conectar com o Google.",
  OAuthCallback: "Erro no retorno do Google. Limpe os cookies de localhost e tente de novo.",
  Callback: "Sessão OAuth expirou. Use http://localhost:3000 e clique em Continuar com Google novamente.",
  AccessDenied: "Acesso negado. Verifique se o MongoDB está conectado (MONGODB_URI_STANDARD).",
};

function resolveAuthErrorMessage(code: string): string {
  if (AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code]!;
  const decoded = decodeURIComponent(code);
  if (decoded.includes("State cookie") || decoded.includes("state")) {
    return "Cookie de sessão perdido. Abra só http://localhost:3000, limpe cookies do site e clique em Continuar com Google de novo.";
  }
  if (code.includes("querySrv") || code.includes("ECONNREFUSED")) {
    return "Login com Google OK, mas o banco MongoDB não conectou (DNS SRV). No Atlas, copie a connection string Standard (não SRV) para MONGODB_URI_STANDARD no .env e reinicie o servidor.";
  }
  if (code.includes("Mongo") || code.includes("mongodb")) {
    return "Erro ao conectar ao MongoDB. Verifique MONGODB_URI no .env.";
  }
  return decodeURIComponent(code).slice(0, 200) || "Não foi possível entrar.";
}

function LoginErrorBanner() {
  const searchParams = useSearchParams();
  const code = searchParams.get("error");
  if (!code) return null;
  const message = resolveAuthErrorMessage(code);
  return (
    <p
      role="alert"
      className="rounded-xl border border-violet-400/35 bg-violet-500/10 px-3 py-2.5 text-sm text-violet-100"
    >
      {message}
    </p>
  );
}

/**
 * Formulário de login — Google OAuth, e-mail/senha, validação em tempo real.
 */
export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/workspace";

  const [showPassword, setShowPassword] = useState(false);
  const [googlePending, setGooglePending] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting, isValid },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: { email: "", password: "", remember: false },
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(REMEMBER_EMAIL_KEY);
      if (saved) {
        setValue("email", saved, { shouldValidate: true });
        setValue("remember", true);
      }
    } catch {
      /* ignore */
    }
  }, [setValue]);

  const handleGoogleSignIn = useCallback(() => {
    setGooglePending(true);
    void redirectToGoogleSignIn(callbackUrl).catch(() => {
      setGooglePending(false);
      toast.error("Não foi possível abrir o login do Google. Tente de novo.");
    });
  }, [callbackUrl]);

  const onSubmit = useCallback(
    async (values: LoginFormValues) => {
      const email = values.email.trim().toLowerCase();

      if (values.remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }

      const result = await signIn("credentials", {
        email,
        password: values.password,
        redirect: false,
        callbackUrl,
      });

      if (result?.error) {
        toast.error("E-mail ou senha incorretos.");
        return;
      }

      if (result?.ok) {
        setSuccess(true);
        toast.success("Login realizado com sucesso!");
        router.push(callbackUrl);
        router.refresh();
      }
    },
    [callbackUrl, router],
  );

  const pending = isSubmitting || googlePending;

  return (
    <div className="relative w-full max-w-[440px] px-1">
      <div
        className="pointer-events-none absolute -inset-x-16 -top-28 h-64 rounded-full opacity-80 blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(99,102,241,0.35) 0%, rgba(59,130,246,0.12) 45%, transparent 70%)",
        }}
        aria-hidden
      />

      <div className="animate-register-enter relative overflow-hidden rounded-2xl border border-white/12 bg-sidebar/60 p-8 shadow-[0_24px_80px_-20px_rgba(67,56,202,0.45)] backdrop-blur-xl ring-1 ring-violet-500/10 sm:p-10">
        <header className="flex flex-col items-center gap-3 text-center">
          <Image
            src="/seuo-logo-icon.svg"
            alt="SEuO SEO"
            width={52}
            height={52}
            className="h-[52px] w-[52px]"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-[1.65rem]">
              Entrar na sua conta
            </h1>
            <p className="mt-1.5 text-sm text-white/55">
              Acesse sua conta para continuar
            </p>
          </div>
        </header>

        <div className="mt-8 flex flex-col gap-5">
          <Suspense fallback={null}>
            <LoginErrorBanner />
          </Suspense>

          {success ? (
            <p
              role="status"
              className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2.5 text-center text-sm text-emerald-200"
            >
              Redirecionando…
            </p>
          ) : null}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={pending}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white px-4 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <GoogleGlyph className="shrink-0" />
            {googlePending ? "Conectando…" : "Continuar com Google"}
          </button>

          <div className="relative flex items-center gap-3">
            <span className="h-px flex-1 bg-white/12" aria-hidden />
            <span className="text-xs font-medium text-white/40">ou entre com seu e-mail</span>
            <span className="h-px flex-1 bg-white/12" aria-hidden />
          </div>

          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="flex flex-col gap-4"
            noValidate
          >
            <AuthInput
              id="login-email"
              label="E-mail"
              type="email"
              autoComplete="email"
              placeholder="Digite seu e-mail"
              leftIcon={<MailIcon className="h-[18px] w-[18px]" />}
              error={errors.email?.message}
              disabled={pending}
              aria-invalid={Boolean(errors.email)}
              {...register("email")}
            />

            <AuthInput
              id="login-password"
              label="Senha"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              leftIcon={<LockIcon className="h-[18px] w-[18px]" />}
              error={errors.password?.message}
              disabled={pending}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded-lg p-2 text-white/45 transition hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-400"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <EyeOffIcon className="h-[18px] w-[18px]" />
                  ) : (
                    <EyeIcon className="h-[18px] w-[18px]" />
                  )}
                </button>
              }
              {...register("password")}
            />

            <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
              <label className="flex cursor-pointer items-center gap-2 text-white/60">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-white/25 bg-black/40 text-violet-500 focus:ring-violet-500/40"
                  disabled={pending}
                  {...register("remember")}
                />
                Lembrar-me
              </label>
              <Link
                href="/recuperar-senha"
                className="font-medium text-violet-300 transition hover:text-violet-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
              >
                Esqueci minha senha
              </Link>
            </div>

            <button
              type="submit"
              disabled={pending || !isValid}
              className="w-full rounded-xl border border-violet-500/50 bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_-8px_rgba(99,102,241,0.65)] transition hover:from-violet-500 hover:to-indigo-500 hover:shadow-[0_12px_40px_-8px_rgba(99,102,241,0.75)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <span
                    className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"
                    aria-hidden
                  />
                  Entrando…
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="border-t border-white/10 pt-6 text-center">
            <p className="text-sm text-white/55">Ainda não possui uma conta?</p>
            <Link
              href="/cadastro"
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/18 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition hover:border-violet-400/40 hover:bg-violet-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
            >
              Criar conta
            </Link>
          </div>

          <Link
            href="/"
            className="text-center text-sm font-medium text-white/40 transition hover:text-white/70"
          >
            ← Voltar à página inicial
          </Link>
        </div>
      </div>
    </div>
  );
}
