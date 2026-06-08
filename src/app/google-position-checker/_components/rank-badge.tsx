import { Award, Medal, Target, TrendingDown } from "lucide-react";



import type { GoogleRankTier } from "~/features/seo/types/google-position-check";



const TIER_CONFIG: Record<

  GoogleRankTier,

  { label: string; className: string; icon: typeof Award }

> = {

  top_3: {

    label: "Top 3",

    className:

      "border-brand/50 bg-brand/20 text-brand-bright shadow-[0_0_24px_-6px_var(--color-brand)]",

    icon: Award,

  },

  top_10: {

    label: "Top 10",

    className:

      "border-brand/40 bg-brand/15 text-brand-bright shadow-[0_0_20px_-8px_var(--color-brand)]",

    icon: Medal,

  },

  top_50: {

    label: "Top 50",

    className: "border-brand/25 bg-brand/10 text-white/80",

    icon: Target,

  },

  not_ranking: {

    label: "Fora do ranking",

    className: "border-white/15 bg-white/5 text-white/55",

    icon: TrendingDown,

  },

};



type RankBadgeProps = {

  tier: GoogleRankTier;

  className?: string;

};



/**

 * Badge visual da faixa de posicionamento orgânico.

 */

export function RankBadge({ tier, className = "" }: RankBadgeProps) {

  const config = TIER_CONFIG[tier];

  const Icon = config.icon;



  return (

    <span

      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${config.className} ${className}`}

    >

      <Icon className="h-3.5 w-3.5" aria-hidden />

      {config.label}

    </span>

  );

}


