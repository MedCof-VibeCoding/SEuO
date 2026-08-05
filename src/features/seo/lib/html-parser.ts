/**
 * Utilitários de extração de sinais SEO a partir de HTML.
 */

export type ParsedHtmlSignals = {
  title?: string;
  metaDescription?: string;
  metaRobots?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  lang?: string;
  h1: string[];
  h2: string[];
  h3: string[];
  estimatedWordCount: number;
  hasTables: boolean;
  hasLists: boolean;
  hasFaqSection: boolean;
  internalLinksCount: number;
  externalLinksCount: number;
  imagesTotal: number;
  imagesWithoutAlt: number;
  hasSchemaMarkup: boolean;
  textExcerpt: string;
};

const EXCERPT_CHARS = 5_000;

/**
 * Extrai metadados e texto visível de um documento HTML.
 */
export function parseHtmlSignals(html: string, pageUrl = ""): ParsedHtmlSignals {
  const title = matchOne(html, /<title[^>]*>([\s\S]*?)<\/title>/i)?.replace(/\s+/g, " ").trim();
  const metaDescription = matchMetaContent(html, "description");
  const metaRobots = matchMetaContent(html, "robots");
  const canonical = matchLinkHref(html, "canonical");
  const ogTitle = matchMetaContent(html, "og:title");
  const ogDescription = matchMetaContent(html, "og:description");
  const lang = html.match(/<html[^>]*\slang=["']([^"']+)["']/i)?.[1];

  const h1 = matchAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi).map(stripTags);
  const h2 = matchAll(html, /<h2[^>]*>([\s\S]*?)<\/h2>/gi).map(stripTags).slice(0, 24);
  const h3 = matchAll(html, /<h3[^>]*>([\s\S]*?)<\/h3>/gi).map(stripTags).slice(0, 24);

  const withoutScripts = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ");

  const visibleText = stripTags(withoutScripts).replace(/\s+/g, " ").trim();
  const words = visibleText.split(/\s+/).filter((w) => w.length > 1);
  const lower = html.toLowerCase();

  const imgTags = matchAll(html, /<img\b[^>]*>/gi);
  const imagesWithoutAlt = imgTags.filter((tag) => !/\balt=["'][^"']+["']/i.test(tag)).length;

  let host = "";
  try {
    if (pageUrl) host = new URL(pageUrl).hostname.replace(/^www\./, "");
  } catch {
    /* ignore */
  }

  const hrefMatches = html.match(/href=["']([^"']+)["']/gi) ?? [];
  let internalLinksCount = 0;
  let externalLinksCount = 0;
  for (const raw of hrefMatches) {
    const href = raw.replace(/^href=["']|["']$/gi, "");
    if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      continue;
    }
    if (href.startsWith("/") || (host && href.includes(host))) {
      internalLinksCount++;
    } else if (/^https?:\/\//i.test(href)) {
      externalLinksCount++;
    }
  }

  return {
    title,
    metaDescription,
    metaRobots,
    canonical,
    ogTitle,
    ogDescription,
    lang,
    h1,
    h2,
    h3,
    estimatedWordCount: words.length,
    hasTables: /<table[\s>]/i.test(html),
    hasLists: /<[ou]l[\s>]/i.test(html),
    hasFaqSection:
      /faq|perguntas frequentes|perguntas e respostas/i.test(lower) ||
      /itemtype=["']https?:\/\/schema\.org\/faqpage/i.test(lower),
    internalLinksCount,
    externalLinksCount,
    imagesTotal: imgTags.length,
    imagesWithoutAlt,
    hasSchemaMarkup: /application\/ld\+json/i.test(html) || /schema\.org/i.test(html),
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
    `<meta[^>]*(?:name|property)=["']${escapeRegex(name)}["'][^>]*content=["']([^"']*)["']|` +
      `<meta[^>]*content=["']([^"']*)["'][^>]*(?:name|property)=["']${escapeRegex(name)}["']`,
    "i",
  );
  const m = html.match(re);
  return (m?.[1] ?? m?.[2])?.trim();
}

function matchLinkHref(html: string, rel: string): string | undefined {
  const re = new RegExp(
    `<link[^>]*rel=["']${rel}["'][^>]*href=["']([^"']+)["']|` +
      `<link[^>]*href=["']([^"']+)["'][^>]*rel=["']${rel}["']`,
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
