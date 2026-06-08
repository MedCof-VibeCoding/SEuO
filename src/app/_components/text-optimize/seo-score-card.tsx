type SeoScoreCardProps = {
  label: string;
  value: string | number;
  sub?: string;
  highlight?: boolean;
};

/**
 * Card compacto de métrica SEO/legibilidade.
 */
export function SeoScoreCard({ label, value, sub, highlight }: SeoScoreCardProps) {
  return (
    <div
      className={
        highlight
          ? "rounded-xl border border-brand/35 bg-brand/10 px-3 py-2.5"
          : "rounded-xl border border-white/10 bg-black/20 px-3 py-2.5"
      }
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-white/45">
        {label}
      </p>
      <p
        className={
          highlight ? "mt-0.5 text-lg font-bold text-brand-bright" : "mt-0.5 text-lg font-bold text-white"
        }
      >
        {value}
      </p>
      {sub ? <p className="text-[10px] text-white/40">{sub}</p> : null}
    </div>
  );
}
