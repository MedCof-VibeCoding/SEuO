import Link from "next/link";
import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Recuperar senha | SEuO SEO",
};

/**
 * Placeholder para recuperação de senha.
 */
export default function RecuperarSenhaPage() {
  return (
    <div className="w-full max-w-md rounded-2xl border border-white/12 bg-sidebar/60 p-8 text-center backdrop-blur-xl">
      <h1 className="text-xl font-bold text-white">Recuperar senha</h1>
      <p className="mt-3 text-sm text-white/55">
        Esta funcionalidade estará disponível em breve. Entre em contato com o suporte se
        precisar de acesso urgente.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-block text-sm font-semibold text-violet-300 hover:text-violet-200"
      >
        ← Voltar ao login
      </Link>
    </div>
  );
}
