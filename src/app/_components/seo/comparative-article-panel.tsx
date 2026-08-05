"use client";

import type { ReactNode } from "react";

import type {
  ActionPlanStepResult,
  ComparativeArticleReport,
  ContentStepResult,
  KeywordsStepResult,
} from "~/features/seo/types/analysis";
import {
  getContentPatterns,
  getOnPagePatterns,
  sliceKeywords,
} from "~/features/seo/lib/comparative-display";
import { resolveCollectedPages } from "~/features/seo/lib/collected-pages";

import { AuditDataSourcesPanel } from "./audit-data-sources-panel";
import { DataCollectionPanel } from "./data-collection-panel";
import { CopyButton } from "./report/copy-button";

/**
 * Caixa de tópico com contagem de itens.
 */
function TopicBox({
  title,
  count,
  children,
}: {
  title: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h4 className="text-sm font-semibold text-white/85">{title}</h4>
        {count !== undefined ? (
          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] font-bold tabular-nums text-white/45">
            {count}
          </span>
        ) : null}
      </div>
      {children}
    </div>
  );
}

/**
 * Lista de itens com marcador discreto.
 */
function TopicList({ items }: { items: string[] }) {
  if (!items.length) {
    return <p className="text-sm text-white/35">Nenhum item identificado.</p>;
  }
  return (
    <ul className="space-y-2 text-sm leading-relaxed text-white/65">
      {items.map((item) => (
        <li key={item} className="flex gap-2">
          <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand-bright" aria-hidden />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * Escopo da auditoria: páginas coletadas, fontes e contexto informado.
 */
export function ArticleCollectionBlock({ article }: { article: ComparativeArticleReport }) {
  const collectedPages = resolveCollectedPages(article);

  return (
    <div className="flex flex-col gap-5">
      <DataCollectionPanel pages={collectedPages} mainKeyword={article.mainKeyword} />

      {article.niche || article.objective ? (
        <dl className="grid gap-3 border-t border-white/[0.06] pt-5 sm:grid-cols-2">
          {article.niche ? (
            <div>
              <dt className="text-xs font-semibold text-white/40">Nicho</dt>
              <dd className="mt-1 text-sm text-white/75">{article.niche}</dd>
            </div>
          ) : null}
          {article.objective ? (
            <div>
              <dt className="text-xs font-semibold text-white/40">Objetivo</dt>
              <dd className="mt-1 text-sm text-white/75">{article.objective}</dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <AuditDataSourcesPanel />
    </div>
  );
}

/**
 * Palavras-chave do artigo: usadas, ausentes, quick wins e cauda longa.
 */
export function ArticleKeywordsBlock({ keywords }: { keywords: KeywordsStepResult }) {
  const kw = sliceKeywords(keywords);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <TopicBox title="Palavras-chave em uso" count={kw.top.length}>
        <TopicList items={kw.top} />
      </TopicBox>
      <TopicBox title="Palavras-chave não usadas" count={kw.gaps.length}>
        <TopicList items={kw.gaps} />
      </TopicBox>
      <TopicBox title="Sugestões de quick wins" count={kw.quickWins.length}>
        <TopicList items={kw.quickWins} />
      </TopicBox>
      <TopicBox title="Cauda longa" count={kw.longTail.length}>
        <TopicList items={kw.longTail} />
      </TopicBox>
    </div>
  );
}

/**
 * Padrões de conteúdo e on-page observados nas páginas coletadas.
 */
export function ArticleOnPageBlock({ content }: { content: ContentStepResult }) {
  const contentPatterns = getContentPatterns(content.content_patterns);
  const onPagePatterns = getOnPagePatterns(content.on_page_patterns);

  return (
    <div className="flex flex-col gap-4">
      <TopicBox title="Padrões de conteúdo">
        <dl className="space-y-2.5">
          {contentPatterns.map(({ label, value }) => (
            <div
              key={label}
              className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5"
            >
              <dt className="text-xs font-semibold text-brand-bright/90">{label}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-white/65">{value}</dd>
            </div>
          ))}
        </dl>
      </TopicBox>

      <TopicBox title="Padrões on-page" count={onPagePatterns.length}>
        {onPagePatterns.length ? (
          <dl className="grid gap-2.5 sm:grid-cols-2">
            {onPagePatterns.map(({ label, value }) => (
              <div
                key={label}
                className="rounded-lg border border-white/[0.06] bg-black/20 px-3 py-2.5"
              >
                <dt className="text-xs font-semibold text-white/80">{label}</dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/65">{value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-white/35">Nenhum padrão identificado.</p>
        )}
      </TopicBox>

      <TopicBox title="Oportunidades de otimização" count={content.content_opportunities.length}>
        <TopicList items={content.content_opportunities} />
      </TopicBox>
    </div>
  );
}

const HORIZONS = [
  { key: "short_term", label: "Curto prazo", hint: "Primeiras 2 semanas" },
  { key: "medium_term", label: "Médio prazo", hint: "1 a 3 meses" },
  { key: "long_term", label: "Longo prazo", hint: "3 meses ou mais" },
] as const;

/**
 * Plano de ação dividido por horizonte de tempo.
 */
export function ArticleActionPlanBlock({
  actionPlan,
}: {
  actionPlan: ActionPlanStepResult;
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {HORIZONS.map(({ key, label, hint }) => {
        const items = actionPlan[key];
        return (
          <div
            key={key}
            className="rounded-xl border border-white/[0.07] bg-black/20 p-4"
          >
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h4 className="text-sm font-semibold text-white/85">{label}</h4>
                <p className="text-[11px] text-white/35">{hint}</p>
              </div>
              {items.length ? (
                <CopyButton text={items.map((item) => `• ${item}`).join("\n")} />
              ) : null}
            </div>
            <TopicList items={items} />
          </div>
        );
      })}
    </div>
  );
}
