import { type Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos de uso | SEuO",
  description: "Termos de uso do SEuO.",
};

export default function TermosPage() {
  return (
    <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-sidebar/80 p-8 text-center backdrop-blur-md">
      <h1 className="text-xl font-bold text-white">Termos de uso</h1>
      <p className="mt-4 text-sm leading-relaxed text-white/65">
        O conteúdo legal completo será publicado aqui. Ao aceitar no cadastro,
        você confirma que leu e concorda com as condições que serão aplicáveis
        ao serviço.
      </p>
      <Link
        href="/register"
        className="mt-8 inline-block text-sm font-semibold text-brand-bright underline-offset-4 hover:underline"
      >
        Voltar ao cadastro
      </Link>
    </div>
  );
}
