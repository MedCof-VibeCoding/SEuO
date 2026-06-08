import type { SeoIssueDetail } from "~/features/seo/types/analysis";

type SeoImpactCardProps = {
  issue: SeoIssueDetail;
  locked?: boolean;
};

/**
 * Card de problema SEO com explicação completa (consultoria).
 */
export function SeoImpactCard({ issue, locked = false }: SeoImpactCardProps) {
  if (locked) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-5 blur-[2px]">
        <p className="font-medium text-white/40">Insight Pro — faça upgrade</p>
      </div>
    );
  }

  return (
    <article className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-seo-accent/25">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-white">{issue.title}</h3>
        <div className="flex gap-2 text-[10px] font-bold uppercase tracking-wide">
          <span className="rounded bg-brand/20 px-1.5 py-0.5 text-brand-bright">
            {issue.priority}
          </span>
          <span className="rounded bg-white/10 px-1.5 py-0.5 text-white/50">
            esforço {issue.effort}
          </span>
        </div>
      </div>
      <p className="mt-3 text-sm text-white/55">{issue.problem}</p>
      <dl className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs font-semibold text-white/40">Impacto SEO</dt>
          <dd className="text-white/70">{issue.seoImpact}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold text-white/40">Impacto conversão</dt>
          <dd className="text-white/70">{issue.conversionImpact}</dd>
        </div>
      </dl>
      <div className="mt-4 rounded-lg border border-seo-accent/20 bg-seo-accent/5 p-3">
        <p className="text-xs font-semibold text-seo-accent-bright">Como corrigir</p>
        <p className="mt-1 text-sm text-white/75">{issue.howToFix}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg bg-red-500/5 p-3">
          <p className="text-[10px] font-bold uppercase text-red-300/80">Exemplo ruim</p>
          <p className="mt-1 text-xs text-white/55">{issue.badExample}</p>
        </div>
        <div className="rounded-lg bg-emerald-500/5 p-3">
          <p className="text-[10px] font-bold uppercase text-emerald-300/80">Exemplo ideal</p>
          <p className="mt-1 text-xs text-white/55">{issue.goodExample}</p>
        </div>
      </div>
      <p className="mt-3 text-xs font-medium text-seo-success">
        Resultado esperado: {issue.expectedResult}
      </p>
    </article>
  );
}
