"use client";

type ScoreRingProps = {
  score: number;
  label: string;
  highlight?: boolean;
  size?: number;
};

/**
 * Anel de score 0–100 com cor dinâmica.
 */
export function ScoreRing({
  score,
  label,
  highlight = false,
  size = 88,
}: ScoreRingProps) {
  const r = (size - 10) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  const color =
    score >= 75
      ? "var(--color-seo-success)"
      : score >= 50
        ? "var(--color-seo-accent-bright)"
        : "var(--color-brand-bright)";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90" aria-hidden>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth={6}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white"
          aria-label={`Score SEO ${score} de 100`}
        >
          {score}
        </span>
      </div>
      <span
        className={[
          "max-w-[120px] truncate text-center text-xs font-medium",
          highlight ? "text-seo-accent-bright" : "text-white/55",
        ].join(" ")}
      >
        {label}
      </span>
    </div>
  );
}
