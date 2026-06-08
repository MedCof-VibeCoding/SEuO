import { type Metadata } from "next";
import { Suspense } from "react";

import { LoginForm } from "./_components/login-form";

export const metadata: Metadata = {
  title: "Entrar | SEuO SEO",
  description: "Acesse sua conta com Google ou e-mail e senha.",
};

/**
 * Página de login da plataforma.
 */
export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="h-40 w-full max-w-md animate-pulse rounded-2xl bg-white/5" />
      }
    >
      <LoginForm />
    </Suspense>
  );
}
