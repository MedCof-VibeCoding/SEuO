import type { ContentIntelligence } from "~/features/seo/types/analysis";

type AiRecommendationPanelProps = {
  content: ContentIntelligence;
  aiNarrative?: string;
  aiProvider?: "gemini" | "openai";
  isPro: boolean;
};

/**
 * Painel de recomendações de copy e estratégia com IA.
 */
export function AiRecommendationPanel({
  content,
  aiNarrative,
  aiProvider,
  isPro,
}: AiRecommendationPanelProps) {
  return (
    <div className="flex flex-col gap-6">
      {aiNarrative ? (
        <div className="rounded-xl border border-seo-accent/25 bg-linear-to-br from-seo-accent/10 to-transparent p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-seo-accent-bright">
            Consultoria IA
            {aiProvider === "gemini" ? " · Gemini" : aiProvider === "openai" ? " · OpenAI" : ""}
          </p>
          <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/75 whitespace-pre-line">
            {aiNarrative}
          </div>
        </div>
      ) : (
        <p className="text-sm text-white/45">
          Configure OPENAI_API_KEY no .env para análise comparativa com OpenAI.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SuggestionBlock title="Títulos sugeridos" items={content.suggestions.titles} />
        <SuggestionBlock title="Headings mais fortes" items={content.suggestions.headings} />
        <SuggestionBlock title="CTAs persuasivos" items={content.suggestions.ctas} />
        <SuggestionBlock
          title="Palavras-chave relacionadas"
          items={content.suggestions.relatedKeywords}
        />
        <SuggestionBlock title="Entidades semânticas" items={content.suggestions.entities} />
        <SuggestionBlock title="FAQs ideais" items={content.suggestions.faqs} />
      </div>

      {!isPro ? (
        <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/50">
          Plano Free: sugestões limitadas. Pro desbloqueia copy completo e plano automático.
        </p>
      ) : null}
    </div>
  );
}

function SuggestionBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
      <h4 className="text-sm font-semibold text-white/85">{title}</h4>
      <ul className="mt-2 list-inside list-disc text-sm text-white/55">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
