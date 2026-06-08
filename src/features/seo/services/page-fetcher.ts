import "server-only";

export type PageFetchRole = "primary" | "competitor";

export type FetchedPageData = {
  url: string;
  role: PageFetchRole;
  fetchStatus: "success" | "partial" | "failed";
  statusCode?: number;
  error?: string;
  title?: string;
  metaDescription?: string;
  h1: string[];
  h2: string[];
  h3: string[];
  estimatedWordCount: number;
  hasTables: boolean;
  hasLists: boolean;
  hasFaqSection: boolean;
  internalLinksCount: number;
  hasSchemaMarkup: boolean;
  textExcerpt: string;
};

const FETCH_TIMEOUT_MS = 18_000;
const MAX_BODY_BYTES = 800_000;
const EXCERPT_CHARS = 5_000;

/**
 * Busca URL e extrai sinais on-page para análise comparativa.
 */
export async function fetchPageForSeoAnalysis(
  url: string,
  role: PageFetchRole,
): Promise<FetchedPageData> {
  const base: FetchedPageData = {
    url,
    role,
    fetchStatus: "failed",
    h1: [],
    h2: [],
    h3: [],
    estimatedWordCount: 0,
    hasTables: false,
    hasLists: false,
    hasFaqSection: false,
    internalLinksCount: 0,
    hasSchemaMarkup: false,
    textExcerpt: "",
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEuO-SEO-Bot/1.0; +https://grupomedcof.com.br)",
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
    });

    clearTimeout(timeout);

    if (!res.ok) {
      return {
        ...base,
        fetchStatus: "partial",
        statusCode: res.status,
        error: `HTTP ${res.status}`,
      };
    }

    const contentType = res.headers.get("content-type") ?? "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return {
        ...base,
        fetchStatus: "partial",
        statusCode: res.status,
        error: "Resposta não é HTML",
      };
    }

    const buffer = await res.arrayBuffer();
    const slice = buffer.byteLength > MAX_BODY_BYTES ? buffer.slice(0, MAX_BODY_BYTES) : buffer;
    const html = new TextDecoder("utf-8", { fatal: false }).decode(slice);

    const parsed = parseHtmlSignals(html, url);
    const fetchStatus =
      parsed.estimatedWordCount < 80 && !parsed.title ? "partial" : "success";

    return {
      ...base,
      ...parsed,
      fetchStatus,
      statusCode: res.status,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Erro de rede";
    return { ...base, error: message };
  }
}

/**
 * Extrai metadados e texto visível de HTML.
 */
function parseHtmlSignals(html: string, pageUrl: string): Omit<
  FetchedPageData,
  "url" | "role" | "fetchStatus" | "statusCode" | "error"
> {
  const title = matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i)?.replace(/\s+/g, " ").trim();
  const metaDescription = matchMetaContent(html, "description");
  const h1 = matchAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(stripTags);
  const h2 = matchAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(stripTags).slice(0, 24);
  const h3 = matchAll(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi).map(stripTags).slice(0, 24);

  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const visibleText = stripTags(withoutScripts).replace(/\s+/g, " ").trim();
  const words = visibleText.split(/\s+/).filter((w) => w.length > 1);
  const hasTables = /<table[\s>]/i.test(html);
  const hasLists = /<[ou]l[\s>]/i.test(html);
  const lower = html.toLowerCase();
  const hasFaqSection =
    /faq|perguntas frequentes|perguntas e respostas/i.test(lower) ||
    /itemtype=["']https?:\/\/schema\.org\/faqpage/i.test(lower);
  const hasSchemaMarkup =
    /application\/ld\+json/i.test(html) ||
    /schema\.org/i.test(html);

  let host: string;
  try {
    host = new URL(pageUrl).hostname;
  } catch {
    host = "";
  }

  const internalLinksCount = host
    ? (html.match(new RegExp(`href=["']https?:\\/\\/(www\\.)?${escapeRegex(host)}`, "gi")) ?? [])
        .length
    : 0;

  return {
    title,
    metaDescription,
    h1,
    h2,
    h3,
    estimatedWordCount: words.length,
    hasTables,
    hasLists,
    hasFaqSection,
    internalLinksCount,
    hasSchemaMarkup,
    textExcerpt: visibleText.slice(0, EXCERPT_CHARS),
  };
}

function matchOne(html: string, pattern: RegExp): string | undefined {
  const m = html.match(pattern);
  return m?.[1] ? stripTags(m[1]) : undefined;
}

function matchAll(html: string, pattern: RegExp): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = new RegExp(pattern.source, pattern.flags);
  while ((m = re.exec(html)) !== null) {
    if (m[1]) out.push(m[1]);
  }
  return out;
}

function matchMetaContent(html: string, name: string): string | undefined {
  const re = new RegExp(
    `<meta[^>]*(?:name|property)=["']${name}["'][^>]*content=["']([^"']*)["']|` +
      `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${name}["']`,
    "i",
  );
  const m = html.match(re);
  return (m?.[1] ?? m?.[2])?.trim();
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
