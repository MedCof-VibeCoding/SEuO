import Link from "next/link";

type SeoCopilotShortcutProps = {
  variant?: "button" | "banner" | "compact";
  className?: string;
};

/**
 * Atalho para o editor de texto SEO com IA (/optimize).
 */
export function SeoCopilotShortcut({
  variant = "button",
  className = "",
}: SeoCopilotShortcutProps) {
  if (variant === "banner") {
    return (
      <Link
        href="/optimize"
        className={[
          "group flex flex-col gap-2 rounded-2xl border border-brand/30 bg-linear-to-br from-brand/15 to-sidebar/80 p-5 transition hover:border-brand/50 hover:from-brand/25 sm:flex-row sm:items-center sm:justify-between",
          className,
        ].join(" ")}
      >
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-brand-bright">
            SEO Copilot · IA
          </p>
          <p className="mt-1 font-semibold text-white">
            Otimize textos para SEO sem mudar a sua mensagem
          </p>
          <p className="mt-1 text-sm text-white/50">
            Legibilidade, palavras-chave, diff visual e métricas antes/depois.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center justify-center rounded-xl border border-brand/45 bg-brand/35 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_-8px_var(--color-brand)] transition group-hover:bg-brand/50">
          Abrir editor →
        </span>
      </Link>
    );
  }

  if (variant === "compact") {
    return (
      <Link
        href="/optimize"
        className={[
          "inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-1.5 text-sm font-medium text-white/75 transition hover:border-brand/35 hover:bg-brand/10 hover:text-white",
          className,
        ].join(" ")}
      >
        <span className="text-brand-bright" aria-hidden>
          ✦
        </span>
        Copilot de texto
      </Link>
    );
  }

  return (
    <Link
      href="/optimize"
      className={[
        "inline-flex items-center justify-center gap-2 rounded-xl border border-brand/45 bg-brand/35 px-5 py-2.5 text-sm font-bold text-white shadow-[0_0_24px_-8px_var(--color-brand)] transition hover:bg-brand/50",
        className,
      ].join(" ")}
    >
      <span aria-hidden>✦</span>
      Otimizar texto com IA
    </Link>
  );
}
