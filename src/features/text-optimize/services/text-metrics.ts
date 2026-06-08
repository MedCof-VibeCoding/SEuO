import type { TextMetrics } from "~/features/text-optimize/types";

const STOPWORDS = new Set([
  "a",
  "o",
  "e",
  "de",
  "da",
  "do",
  "em",
  "um",
  "uma",
  "para",
  "com",
  "que",
  "na",
  "no",
  "os",
  "as",
  "por",
  "se",
  "ao",
  "dos",
  "das",
  "como",
  "mais",
  "mas",
  "ou",
  "seu",
  "sua",
  "seus",
  "suas",
  "isso",
  "esta",
  "este",
  "essa",
  "esse",
  "the",
  "and",
  "or",
  "to",
  "of",
  "in",
  "for",
]);

/**
 * Extrai palavras significativas para densidade e cobertura.
 */
function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\p{L}\p{N}\s-]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOPWORDS.has(w));
}

/**
 * Calcula métricas heurísticas de SEO e legibilidade do texto.
 */
export function analyzeTextMetrics(text: string, targetKeyword?: string): TextMetrics {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const charCount = trimmed.length;

  const sentences = trimmed
    .split(/[.!?]+/)
    .map((s) => s.trim())
    .filter(Boolean);
  const avgSentenceLength =
    sentences.length > 0
      ? words.length / sentences.length
      : words.length;

  const headingMatches = trimmed.match(/^#{1,3}\s+.+$/gm) ?? [];
  const headingCount = headingMatches.length;

  const tokens = tokenize(trimmed);
  const freq = new Map<string, number>();
  for (const t of tokens) {
    freq.set(t, (freq.get(t) ?? 0) + 1);
  }
  const topKeywords = [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({
      word,
      density: wordCount > 0 ? Math.round((count / wordCount) * 1000) / 10 : 0,
    }));

  const keyword = targetKeyword?.toLowerCase().trim();
  const keywordHits = keyword
    ? (trimmed.toLowerCase().match(new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g")) ?? [])
        .length
    : 0;
  const keywordCoverage = keyword
    ? Math.min(100, Math.round((keywordHits / Math.max(3, wordCount / 100)) * 100))
    : Math.min(100, Math.round((topKeywords.length / 12) * 100));

  let seoScore = 40;
  if (wordCount >= 150) seoScore += 12;
  if (wordCount >= 400) seoScore += 8;
  if (headingCount >= 1) seoScore += 10;
  if (headingCount >= 3) seoScore += 8;
  if (keyword && keywordHits >= 2) seoScore += 12;
  if (avgSentenceLength <= 22) seoScore += 8;
  if (avgSentenceLength > 32) seoScore -= 10;
  seoScore = Math.max(0, Math.min(100, seoScore));

  const readability =
    avgSentenceLength <= 18
      ? "Alta"
      : avgSentenceLength <= 26
        ? "Média"
        : "Baixa";

  const scannability =
    headingCount >= 2 && avgSentenceLength <= 24
      ? "Alta"
      : headingCount >= 1 || avgSentenceLength <= 28
        ? "Média"
        : "Baixa";

  const ctrEstimate =
    Math.round(
      (2.5 +
        (headingCount > 0 ? 0.6 : 0) +
        (readability === "Alta" ? 1.2 : readability === "Média" ? 0.5 : 0) +
        (keyword && keywordHits > 0 ? 0.8 : 0)) *
        10,
    ) / 10;

  return {
    seoScore,
    readability,
    ctrEstimate,
    keywordCoverage,
    scannability,
    wordCount,
    charCount,
    headingCount,
    avgSentenceLength: Math.round(avgSentenceLength * 10) / 10,
    topKeywords,
  };
}

/**
 * Aplica boost nas métricas pós-otimização (heurística).
 */
export function boostMetricsAfter(
  before: TextMetrics,
  optimizedText: string,
  targetKeyword?: string,
): TextMetrics {
  const base = analyzeTextMetrics(optimizedText, targetKeyword);
  return {
    ...base,
    seoScore: Math.min(100, Math.max(base.seoScore, before.seoScore + 12)),
    keywordCoverage: Math.min(100, Math.max(base.keywordCoverage, before.keywordCoverage + 18)),
    ctrEstimate: Math.min(9.9, Math.max(base.ctrEstimate, before.ctrEstimate + 1.2)),
    readability:
      base.readability === "Baixa" && before.readability !== "Alta"
        ? "Média"
        : base.readability === "Média" && before.readability === "Baixa"
          ? "Média"
          : base.readability === "Baixa"
            ? before.readability
            : "Alta",
    scannability:
      base.scannability === "Baixa" ? (before.scannability === "Alta" ? "Média" : "Média") : base.scannability,
  };
}
