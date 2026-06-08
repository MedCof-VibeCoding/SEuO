import type { ContentBriefing } from "~/features/content-briefing/types";

/**
 * Contagem de caracteres para title/description.
 */
export function charCount(text: string): number {
  return text.length;
}

export function titleStatus(len: number): "ok" | "warn" | "error" {
  if (len >= 30 && len <= 60) return "ok";
  if (len === 0) return "warn";
  return len < 30 || len > 60 ? "error" : "warn";
}

export function descriptionStatus(len: number): "ok" | "warn" | "error" {
  if (len >= 140 && len <= 160) return "ok";
  if (len === 0) return "warn";
  return len < 120 || len > 170 ? "error" : "warn";
}

/**
 * Calcula progresso do checklist (0–100).
 */
export function checklistProgress(checklist: Record<string, boolean>): number {
  const keys = Object.keys(checklist);
  if (keys.length === 0) return 0;
  const done = keys.filter((k) => checklist[k]).length;
  return Math.round((done / keys.length) * 100);
}

/**
 * Densidade simples de palavra-chave no texto de produção.
 */
export function keywordDensity(text: string, keyword: string): number {
  if (!keyword.trim() || !text.trim()) return 0;
  const words = text.toLowerCase().split(/\s+/).filter(Boolean);
  const kw = keyword.toLowerCase().trim();
  const hits = words.filter((w) => w.includes(kw) || kw.includes(w)).length;
  return words.length > 0 ? Math.round((hits / words.length) * 1000) / 10 : 0;
}

/**
 * Exporta briefing em Markdown.
 */
export function exportBriefingMarkdown(b: ContentBriefing): string {
  return `# Briefing: ${b.projectName}

**Palavra-chave:** ${b.mainKeyword}  
**Status:** ${b.status} | **Responsável:** ${b.owner}  
**Criado:** ${new Date(b.createdAt).toLocaleDateString("pt-BR")}

## Meta tags
- **Title:** ${b.meta.title}
- **Description:** ${b.meta.description}
- **URL:** ${b.meta.suggestedUrl}

## Objetivo estratégico
${b.strategic.objective}

**Tipo:** ${b.strategic.contentType} | **Funil:** ${b.strategic.funnelStage}  
**Público:** ${b.strategic.audience}  
**Intenção macro:** ${b.strategic.macroIntent}

### Micro intenções
${b.strategic.microIntents}

### Justificativa
${b.strategic.rationale}

### Insights SERP
${b.strategic.serpInsights}

## GEO + SEO
- **Primárias:** ${b.geoSeo.primaryKeywords}
- **Secundárias:** ${b.geoSeo.secondaryKeywords}
- **Entidades:** ${b.geoSeo.semanticEntities}
- **GEO Score:** ${b.geoSeo.geoScore} | **SEO Score:** ${b.geoSeo.seoScore}

### Dicas IA generativa
${b.geoSeo.aiGenerativeTips}

## Estrutura
${b.structure.blocks.map((bl) => `- [${bl.checked ? "x" : " "}] ${bl.type.toUpperCase()}: ${bl.title} — ${bl.notes}`).join("\n")}

## FAQ
${b.faq.map((f) => `### ${f.question}\n${f.answer}`).join("\n\n")}

## Produção
${b.production.body}
`;
}

/**
 * Gera snapshot JSON para histórico de versões.
 */
export function snapshotBriefing(b: ContentBriefing): string {
  return JSON.stringify(b);
}
