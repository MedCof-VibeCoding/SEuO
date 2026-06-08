type SeuoLogoProps = {
  className?: string;
  /** header: ícone + marca | full: ícone maior | icon: só lupa */
  variant?: "header" | "full" | "icon";
  showSeoLabel?: boolean;
};

const BRAND = "var(--color-brand, #e2263c)";

/**
 * Logo SEuO — lupa branca sobre fundo vermelho.
 */
export function SeuoLogo({
  className = "",
  variant = "header",
  showSeoLabel = true,
}: SeuoLogoProps) {
  if (variant === "icon" || variant === "full") {
    return (
      <svg
        className={className}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="SEuO"
      >
        <SeuoMark />
      </svg>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        className="h-9 w-9 shrink-0"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <SeuoMark />
      </svg>
      <span className="flex items-baseline gap-0 font-bold tracking-tight">
        <span className="text-[1.15rem] text-white">SE</span>
        <span className="text-sm text-brand-bright">u</span>
        <span className="text-[1.15rem] text-white">O</span>
        {showSeoLabel ? (
          <span className="ml-1.5 text-sm font-normal text-white/45">SEO</span>
        ) : null}
      </span>
    </span>
  );
}

function SeuoMark() {
  return (
    <>
      <rect width={48} height={48} rx={10} fill={BRAND} />
      <circle cx={20.5} cy={20.5} r={8.5} stroke="#ffffff" strokeWidth={3} fill="none" />
      <path
        d="M27 27L35.5 35.5"
        stroke="#ffffff"
        strokeWidth={3}
        strokeLinecap="round"
      />
    </>
  );
}
