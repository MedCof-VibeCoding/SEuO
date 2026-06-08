import { domainSeed, seededFloat, seededRange } from "~/features/seo/lib/domain-seed";
import type {
  CategoryScores,
  DomainAnalysis,
  DomainRole,
  MetricStatus,
  SeoCategory,
  SeoMetric,
} from "~/features/seo/types/analysis";

function metricStatus(score: number): MetricStatus {
  if (score >= 75) return "pass";
  if (score >= 50) return "warn";
  return "fail";
}

/**
 * Gera métricas mock determinísticas por domínio (simula Lighthouse, PageSpeed, etc.).
 */
function buildMetrics(domain: string, seed: number): SeoMetric[] {
  const loadMs = seededRange(seed, 800, 4200, 1);
  const lcp = seededFloat(seed, 1.2, 5.5, 2);
  const cls = seededFloat(seed, 0.01, 0.25, 3);
  const inp = seededRange(seed, 80, 450, 4);
  const lighthouse = seededRange(seed, 42, 98, 5);
  const ttfb = seededRange(seed, 120, 890, 6);
  const pageWeight = seededRange(seed, 420, 3200, 7);
  const requests = seededRange(seed, 18, 142, 8);
  const da = seededRange(seed, 12, 78, 9);
  const backlinks = seededRange(seed, 120, 48000, 10);
  const refDomains = seededRange(seed, 15, 2400, 11);
  const wordCount = seededRange(seed, 320, 2800, 12);
  const readability = seededRange(seed, 55, 92, 13);

  const bool = (salt: number, threshold = 0.45) =>
    seededRange(seed, 0, 100, salt) > threshold * 100;

  const mk = (
    id: string,
    label: string,
    category: SeoCategory,
    score: number,
    displayValue: string,
    value: string | number | boolean,
  ): SeoMetric => ({
    id,
    label,
    category,
    score,
    displayValue,
    value,
    status: metricStatus(score),
  });

  return [
    mk("load-time", "Tempo de carregamento", "technical", Math.max(0, 100 - Math.floor(loadMs / 45)), `${loadMs} ms`, loadMs),
    mk("lcp", "LCP (Core Web Vital)", "technical", Math.max(0, 100 - Math.floor(lcp * 18)), `${lcp}s`, lcp),
    mk("cls", "CLS (Core Web Vital)", "technical", Math.max(0, 100 - Math.floor(cls * 280)), String(cls), cls),
    mk("inp", "INP (Core Web Vital)", "technical", Math.max(0, 100 - Math.floor(inp / 5)), `${inp} ms`, inp),
    mk("mobile", "Mobile friendly", "technical", bool(14) ? 88 : 52, bool(14) ? "Sim" : "Parcial", bool(14)),
    mk("ssl", "SSL ativo", "technical", bool(15) ? 100 : 0, bool(15) ? "HTTPS" : "HTTP", bool(15)),
    mk("sitemap", "Sitemap.xml", "technical", bool(16) ? 95 : 30, bool(16) ? "Encontrado" : "Ausente", bool(16)),
    mk("robots", "Robots.txt", "technical", bool(17) ? 90 : 40, bool(17) ? "OK" : "Incompleto", bool(17)),
    mk("compression", "GZIP/Brotli", "technical", bool(18) ? 92 : 45, bool(18) ? "Brotli" : "GZIP apenas", bool(18)),
    mk("headings", "Estrutura H1–H3", "technical", seededRange(seed, 45, 95, 19), "Hierárquica", "ok"),
    mk("canonical", "Canonical tags", "technical", bool(20) ? 88 : 55, bool(20) ? "Presente" : "Parcial", bool(20)),
    mk("og", "Open Graph", "technical", bool(21) ? 90 : 48, bool(21) ? "Completo" : "Básico", bool(21)),
    mk("meta-title", "Meta title", "technical", seededRange(seed, 40, 98, 22), `${seededRange(seed, 28, 62, 23)} chars`, "ok"),
    mk("meta-desc", "Meta description", "technical", seededRange(seed, 35, 95, 24), `${seededRange(seed, 80, 165, 25)} chars`, "ok"),
    mk("alt-tags", "Alt em imagens", "technical", seededRange(seed, 30, 92, 26), `${seededRange(seed, 45, 98, 27)}%`, seededRange(seed, 45, 98, 27)),
    mk("schema", "Schema markup", "technical", bool(28) ? 94 : 38, bool(28) ? "JSON-LD" : "Ausente", bool(28)),

    mk("lighthouse", "Lighthouse score", "performance", lighthouse, `${lighthouse}/100`, lighthouse),
    mk("ttfb", "TTFB", "performance", Math.max(0, 100 - Math.floor(ttfb / 10)), `${ttfb} ms`, ttfb),
    mk("tti", "Tempo até interação", "performance", seededRange(seed, 48, 94, 29), `${seededRange(seed, 1.8, 6.2, 30)}s`, seededRange(seed, 1800, 6200, 30)),
    mk("page-weight", "Peso da página", "performance", Math.max(0, 100 - Math.floor(pageWeight / 35)), `${(pageWeight / 1000).toFixed(1)} MB`, pageWeight),
    mk("requests", "Quantidade de requests", "performance", Math.max(0, 100 - requests), String(requests), requests),
    mk("perf-mobile", "Performance mobile", "performance", seededRange(seed, 38, 96, 31), `${seededRange(seed, 35, 92, 32)}/100`, seededRange(seed, 35, 92, 32)),
    mk("perf-desktop", "Performance desktop", "performance", seededRange(seed, 52, 99, 33), `${seededRange(seed, 55, 99, 34)}/100`, seededRange(seed, 55, 99, 34)),

    mk("keyword-density", "Densidade de palavras-chave", "content", seededRange(seed, 42, 88, 35), `${seededFloat(seed, 1.2, 3.8, 36)}%`, seededFloat(seed, 1.2, 3.8, 36)),
    mk("content-length", "Tamanho médio dos textos", "content", seededRange(seed, 40, 90, 37), `${wordCount} palavras`, wordCount),
    mk("update-freq", "Frequência de atualização", "content", seededRange(seed, 35, 85, 38), seededRange(seed, 0, 100, 39) > 50 ? "Semanal" : "Mensal", "ok"),
    mk("semantic", "Estrutura semântica", "content", seededRange(seed, 45, 92, 40), "Boa", "ok"),
    mk("readability", "Legibilidade", "content", readability, `${readability}/100`, readability),

    mk("domain-authority", "Domain authority (est.)", "authority", da, `${da}/100`, da),
    mk("backlinks", "Backlinks (est.)", "authority", Math.min(100, Math.floor(Math.log10(backlinks + 1) * 28)), backlinks.toLocaleString("pt-BR"), backlinks),
    mk("ref-domains", "Referring domains", "authority", Math.min(100, Math.floor(Math.log10(refDomains + 1) * 32)), refDomains.toLocaleString("pt-BR"), refDomains),
    mk("anchor-diversity", "Diversidade de anchor", "authority", seededRange(seed, 38, 88, 41), `${seededRange(seed, 42, 78, 42)}%`, seededRange(seed, 42, 78, 42)),

    mk("perceived-speed", "Velocidade percebida", "ux", seededRange(seed, 40, 94, 43), "Boa", "ok"),
    mk("visual-hierarchy", "Hierarquia visual", "ux", seededRange(seed, 45, 92, 44), `${seededRange(seed, 55, 90, 45)}/100`, seededRange(seed, 55, 90, 45)),
    mk("cta-clarity", "Clareza de CTA", "ux", seededRange(seed, 42, 95, 46), seededRange(seed, 0, 100, 47) > 55 ? "Clara" : "Média", "ok"),
    mk("scannability", "Escaneabilidade", "ux", seededRange(seed, 48, 93, 48), `${seededRange(seed, 60, 92, 49)}/100`, seededRange(seed, 60, 92, 49)),
    mk("responsive", "Responsividade", "ux", bool(50) ? 92 : 58, bool(50) ? "Excelente" : "Ajustes necessários", bool(50)),
  ];
}

function categoryScoresFromMetrics(metrics: SeoMetric[]): CategoryScores {
  const cats: SeoCategory[] = ["technical", "performance", "content", "authority", "ux"];
  const result = {} as CategoryScores;
  for (const cat of cats) {
    const items = metrics.filter((m) => m.category === cat);
    const avg =
      items.length > 0
        ? Math.round(items.reduce((s, m) => s + m.score, 0) / items.length)
        : 0;
    result[cat] = avg;
  }
  return result;
}

/**
 * Analisa um domínio e retorna scores + métricas.
 */
export function analyzeDomain(domain: string, role: DomainRole): Omit<DomainAnalysis, "rank"> {
  const seed = domainSeed(domain);
  const metrics = buildMetrics(domain, seed);
  const categoryScores = categoryScoresFromMetrics(metrics);
  const overallScore = Math.round(
    (categoryScores.technical +
      categoryScores.performance +
      categoryScores.content +
      categoryScores.authority +
      categoryScores.ux) /
      5,
  );

  return {
    domain,
    role,
    overallScore,
    categoryScores,
    metrics,
  };
}
