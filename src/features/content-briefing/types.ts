export type BriefingStatus = "draft" | "in_review" | "approved" | "published";

export type ContentType =
  | "blog_post"
  | "landing_page"
  | "guide"
  | "pillar"
  | "comparison"
  | "faq_hub";

export type FunnelStage = "awareness" | "consideration" | "decision" | "retention";

export type StructureBlockType =
  | "h1"
  | "h2"
  | "h3"
  | "intro"
  | "faq"
  | "cta"
  | "semantic"
  | "custom";

export type StructureBlock = {
  id: string;
  type: StructureBlockType;
  title: string;
  notes: string;
  checked: boolean;
};

export type InternalLink = {
  id: string;
  anchor: string;
  url: string;
  priority: "alta" | "media" | "baixa";
  linkType: "contextual" | "navegacional" | "conversao";
  status: "pendente" | "incluido";
};

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type BriefingComment = {
  id: string;
  author: string;
  text: string;
  createdAt: string;
};

export type BriefingVersion = {
  id: string;
  label: string;
  savedAt: string;
  snapshot: string;
};

export type VisualAsset = {
  id: string;
  label: string;
  altText: string;
  notes: string;
};

export type ContentBriefing = {
  id: string;
  createdAt: string;
  updatedAt: string;
  projectName: string;
  mainKeyword: string;
  status: BriefingStatus;
  owner: string;
  meta: {
    title: string;
    description: string;
    suggestedUrl: string;
  };
  strategic: {
    objective: string;
    contentType: ContentType;
    funnelStage: FunnelStage;
    audience: string;
    macroIntent: string;
    microIntents: string;
    rationale: string;
    serpInsights: string;
  };
  geoSeo: {
    primaryKeywords: string;
    secondaryKeywords: string;
    semanticEntities: string;
    faqTopics: string;
    peopleAlsoAsk: string;
    relatedTerms: string;
    semanticIntent: string;
    geoScore: number;
    seoScore: number;
    aiGenerativeTips: string;
    llmContextBlocks: string;
    aiOverviewSnippet: string;
  };
  structure: {
    blocks: StructureBlock[];
  };
  guidelines: {
    tone: string;
    scannability: string;
    maxLinesPerParagraph: number;
    boldRules: string;
    internalLinking: string;
    uxWriting: string;
    mobile: string;
    generativeAi: string;
  };
  internalLinks: InternalLink[];
  visuals: {
    imageSuggestions: string;
    bannerCta: string;
    highlightBlocks: string;
    infographics: string;
    assets: VisualAsset[];
  };
  production: {
    body: string;
  };
  faq: FaqItem[];
  checklist: Record<string, boolean>;
  comments: BriefingComment[];
  versions: BriefingVersion[];
};
