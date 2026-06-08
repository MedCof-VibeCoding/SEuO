import Link from "next/link";



type GooglePositionShortcutProps = {

  variant?: "button" | "banner" | "compact" | "checker";

  className?: string;

};



const HREF = "/google-position-checker";



/**

 * Atalho para o Google Position Checker.

 */

export function GooglePositionShortcut({

  variant = "button",

  className = "",

}: GooglePositionShortcutProps) {

  if (variant === "banner") {

    return (

      <Link

        href={HREF}

        className={[

          "group flex flex-col gap-2 rounded-2xl border border-white/12 bg-linear-to-br from-white/[0.04] to-sidebar/80 p-5 transition hover:border-brand/35 sm:flex-row sm:items-center sm:justify-between",

          className,

        ].join(" ")}

      >

        <div>

          <p className="text-xs font-bold uppercase tracking-wider text-brand-bright">

            Google Position Checker

          </p>

          <p className="mt-1 font-semibold text-white">

            Descubra a posição da sua URL no Google

          </p>

          <p className="mt-1 text-sm text-white/50">

            URL + palavra-chave, ranking, snippet e evolução estimada.

          </p>

        </div>

        <span className="inline-flex shrink-0 items-center justify-center rounded-xl border border-brand/45 bg-brand/25 px-5 py-2.5 text-sm font-bold text-white transition group-hover:bg-brand/35">

          Verificar posição →

        </span>

      </Link>

    );

  }



  if (variant === "checker" || variant === "compact") {

    return (

      <Link

        href={HREF}

        className={[

          variant === "checker"

            ? "inline-flex items-center justify-center gap-2 rounded-xl border border-brand/35 bg-brand/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-brand/50 hover:bg-brand/20"

            : "inline-flex items-center gap-2 rounded-lg border border-white/12 px-3 py-1.5 text-sm font-medium text-white/75 transition hover:border-brand/35 hover:bg-brand/10",

          className,

        ].join(" ")}

      >

        {variant === "compact" ? <span aria-hidden>⌕</span> : null}

        Google Position Checker

      </Link>

    );

  }



  return (

    <Link

      href={HREF}

      className={[

        "inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-brand/35 hover:bg-brand/10",

        className,

      ].join(" ")}

    >

      <span aria-hidden>⌕</span>

      Google Position Checker

    </Link>

  );

}


