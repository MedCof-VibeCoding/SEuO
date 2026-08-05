import { z } from "zod";

import {
  normalizeContentPatternKey,
  normalizeOnPagePatternKey,
} from "~/features/seo/lib/comparative-display";
import {
  coerceStringList,
  coerceStringRecord,
  unwrapStepPayload,
} from "~/features/seo/services/parse-ai-json";

function normalizeContentPatternsRecord(
  value: unknown,
): Record<string, string> {
  const raw = coerceStringRecord(value);
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    out[normalizeContentPatternKey(key)] = val;
  }
  return out;
}

function normalizeOnPagePatternsRecord(value: unknown): Record<string, string> {
  const raw = coerceStringRecord(value);
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(raw)) {
    out[normalizeOnPagePatternKey(key)] = val;
  }
  return out;
}

const max10 = z.array(z.string()).max(10);

const keywordsShape = z.object({
  top_keywords: max10,
  keyword_gaps: max10,
  quick_wins: max10,
  long_tail_opportunities: max10,
});

export type KeywordsAnalysis = z.infer<typeof keywordsShape>;

export const keywordsAnalysisSchema = z.preprocess((data) => {
  const root = unwrapStepPayload(data, ["keywords", "keyword_analysis", "result", "data"]);
  return {
    top_keywords: coerceStringList(root.top_keywords),
    keyword_gaps: coerceStringList(root.keyword_gaps ?? root.gaps),
    quick_wins: coerceStringList(root.quick_wins),
    long_tail_opportunities: coerceStringList(
      root.long_tail_opportunities ?? root.long_tail ?? root.longTailOpportunities,
    ),
  };
}, keywordsShape);

const backlinksShape = z.object({
  authority_comparison: z.record(z.string()),
  link_gaps: max10,
  replicable_patterns: max10,
  top_link_opportunities: max10,
});

export type BacklinksAnalysis = z.infer<typeof backlinksShape>;

export const backlinksAnalysisSchema = z.preprocess((data) => {
  const root = unwrapStepPayload(data, ["backlinks", "backlink_analysis", "result", "data"]);
  return {
    authority_comparison: coerceStringRecord(
      root.authority_comparison ?? root.authorityComparison,
    ),
    link_gaps: coerceStringList(root.link_gaps ?? root.gaps),
    replicable_patterns: coerceStringList(
      root.replicable_patterns ?? root.patterns,
    ),
    top_link_opportunities: coerceStringList(
      root.top_link_opportunities ?? root.opportunities,
    ),
  };
}, backlinksShape);

const contentShape = z.object({
  content_patterns: z.record(z.string()),
  on_page_patterns: z.record(z.string()),
  content_opportunities: max10,
});

export type ContentAnalysis = z.infer<typeof contentShape>;

export const contentAnalysisSchema = z.preprocess((data) => {
  const root = unwrapStepPayload(data, ["content", "content_analysis", "result", "data"]);
  return {
    content_patterns: normalizeContentPatternsRecord(
      root.content_patterns ?? root.contentPatterns,
    ),
    on_page_patterns: normalizeOnPagePatternsRecord(
      root.on_page_patterns ?? root.onPagePatterns,
    ),
    content_opportunities: coerceStringList(
      root.content_opportunities ?? root.opportunities,
    ),
  };
}, contentShape);

const actionPlanShape = z.object({
  short_term: z.array(z.string()).max(5),
  medium_term: z.array(z.string()).max(5),
  long_term: z.array(z.string()).max(5),
});

export type ActionPlanAnalysis = z.infer<typeof actionPlanShape>;

export const actionPlanAnalysisSchema = z.preprocess((data) => {
  const root = unwrapStepPayload(data, [
    "action_plan",
    "actionPlan",
    "plan",
    "plano",
    "result",
    "data",
  ]);
  return {
    short_term: coerceStringList(root.short_term ?? root.shortTerm, 5),
    medium_term: coerceStringList(root.medium_term ?? root.mediumTerm, 5),
    long_term: coerceStringList(root.long_term ?? root.longTerm, 5),
  };
}, actionPlanShape);

export type ComparativeAnalysisSteps = {
  keywords: KeywordsAnalysis;
  backlinks: BacklinksAnalysis;
  content: ContentAnalysis;
  actionPlan: ActionPlanAnalysis;
};
