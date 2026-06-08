"use client";

import type { ReactNode } from "react";

import type { ComparativeArticleReport } from "~/features/seo/types/analysis";
import {
  getContentPatterns,
  getOnPagePatterns,
  sliceKeywords,
} from "~/features/seo/lib/comparative-display";
import { resolveCollectedPages } from "~/features/seo/lib/collected-pages";
import { DataCollectionPanel } from "./data-collection-panel";
import { SeoPanel } from "./seo-panel";

type ComparativeArticlePanelProps = {
  article: ComparativeArticleReport;
};

function TopicBox({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white/90">{title}</h3>
      {children}
    </div>
  );
}

function TopicList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-sm text-white/40">Nenhum item identificado.</p>;
  }
  return (
    <ul className="list-inside list-disc space-y-1.5 text-sm leading-relaxed text-white/70">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/**
 * Dashboard da análise comparativa — keywords, conteúdo on-page e plano de ação.
 */
export function ComparativeArticlePanel({ article }: ComparativeArticlePanelProps) {
  const { keywords, content, actionPlan } = article;
  const kw = sliceKeywords(keywords);
  const contentPatterns = getContentPatterns(content.content_patterns);
  const onPagePatterns = getOnPagePatterns(content.on_page_patterns);
  const collectedPages = resolveCollectedPages(article);

  return (
    <div className="flex flex-col gap-8">
      <SeoPanel>
        <DataCollectionPanel
          pages={collectedPages}
          mainKeyword={article.mainKeyword}
        />
      </SeoPanel>

      <section>
        <h2 className="mb-4 text-base font-semibold text-brand-bright">1 · Palavras-chave</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <TopicBox title="Palavras-chave">
            <TopicList items={kw.top} />
          </TopicBox>
          <TopicBox title="Palavras-chave não usadas">
            <TopicList items={kw.gaps} />
          </TopicBox>
          <TopicBox title="Sugestões de Quickwins">
            <TopicList items={kw.quickWins} />
          </TopicBox>
          <TopicBox title="Cauda longa">
            <TopicList items={kw.longTail} />
          </TopicBox>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-brand-bright">
          2 · Conteúdo On-Page
        </h2>
        <div className="flex flex-col gap-4">
          <TopicBox title="Padrões de conteúdo">
            <dl className="space-y-3">
              {contentPatterns.map(({ label, value }) => (
                <div key={label} className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
                  <dt className="text-xs font-semibold text-brand-bright/90">{label}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-white/65">{value}</dd>
                </div>
              ))}
            </dl>
          </TopicBox>

          <TopicBox title="Padrões On-Page">
            {onPagePatterns.length ? (
              <dl className="space-y-3">
                {onPagePatterns.map(({ label, value }) => (
                  <div key={label} className="rounded-lg border border-white/8 bg-black/20 px-3 py-2">
                    <dt className="text-xs font-semibold text-white/80">{label}</dt>
                    <dd className="mt-1 text-sm leading-relaxed text-white/65">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : (
              <p className="text-sm text-white/40">Nenhum padrão identificado.</p>
            )}
          </TopicBox>

          <TopicBox title="Oportunidades de Otimização">
            <TopicList items={content.content_opportunities} />
          </TopicBox>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-base font-semibold text-brand-bright">3 · Plano de Ação</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <TopicBox title="Curto Prazo">
            <TopicList items={actionPlan.short_term} />
          </TopicBox>
          <TopicBox title="Médio Prazo">
            <TopicList items={actionPlan.medium_term} />
          </TopicBox>
          <TopicBox title="Longo Prazo">
            <TopicList items={actionPlan.long_term} />
          </TopicBox>
        </div>
      </section>
    </div>
  );
}
