/** Broad content domains — insights should reference these, not specific topics. */
export type ContentDomainKey =
  | "startup_insights"
  | "entrepreneurship"
  | "founder_journey"
  | "product_building"
  | "technical_engineering"
  | "industry_trends"
  | "career_growth"
  | "marketing_growth"
  | "leadership"
  | "personal_story"
  | "general";

type DomainDef = {
  key: ContentDomainKey;
  label: string;
  keywords: string[];
};

export const CONTENT_DOMAINS: DomainDef[] = [
  {
    key: "startup_insights",
    label: "Startup insights",
    keywords: [
      "startup",
      "startups",
      "founder",
      "fundraising",
      "fundraise",
      "pitch deck",
      "mvp",
      "product-market",
      "pmf",
      "bootstrap",
      "saas",
      "series a",
      "series b",
      "venture",
      "vc ",
      "runway",
      "burn rate",
      "go-to-market",
      "gtm",
      "early stage",
      "seed round",
    ],
  },
  {
    key: "entrepreneurship",
    label: "Entrepreneurship",
    keywords: [
      "entrepreneur",
      "entrepreneurship",
      "business owner",
      "solopreneur",
      "side hustle",
      "small business",
      "building a business",
      "first-time founder",
      "co-founder",
      "cofounder",
    ],
  },
  {
    key: "founder_journey",
    label: "Founder journey",
    keywords: [
      "journey",
      "lesson learned",
      "lessons learned",
      "what i learned",
      "mistake",
      "mistakes",
      "failed",
      "failure",
      "pivot",
      "behind the scenes",
      "building in public",
      "year in review",
      "month in review",
    ],
  },
  {
    key: "product_building",
    label: "Product building",
    keywords: [
      "product",
      "feature",
      "roadmap",
      "user research",
      "ux",
      "ui ",
      "design",
      "prototype",
      "ship",
      "shipping",
      "iteration",
      "customer feedback",
      "product launch",
    ],
  },
  {
    key: "technical_engineering",
    label: "Technical / engineering",
    keywords: [
      "engineering",
      "developer",
      "software",
      "code",
      "coding",
      "architecture",
      "api",
      "database",
      "ai ",
      "machine learning",
      "llm",
      "tech stack",
      "open source",
      "devops",
      "cloud",
      "system design",
    ],
  },
  {
    key: "industry_trends",
    label: "Industry & trends",
    keywords: [
      "trend",
      "trends",
      "market",
      "industry",
      "news",
      "report",
      "forecast",
      "prediction",
      "landscape",
      "disruption",
      "regulation",
      "policy",
    ],
  },
  {
    key: "career_growth",
    label: "Career & growth",
    keywords: [
      "career",
      "job",
      "hiring",
      "interview",
      "resume",
      "promotion",
      "manager",
      "management",
      "team lead",
      "skills",
      "learning",
      "mentorship",
      "networking",
    ],
  },
  {
    key: "marketing_growth",
    label: "Marketing & growth",
    keywords: [
      "marketing",
      "growth",
      "content marketing",
      "seo",
      "ads",
      "campaign",
      "brand",
      "branding",
      "audience",
      "conversion",
      "funnel",
      "linkedin growth",
      "personal brand",
    ],
  },
  {
    key: "leadership",
    label: "Leadership",
    keywords: [
      "leadership",
      "leader",
      "ceo",
      "executive",
      "culture",
      "team building",
      "decision",
      "strategy",
      "vision",
      "org",
      "organization",
    ],
  },
  {
    key: "personal_story",
    label: "Personal stories",
    keywords: [
      "personal",
      "story",
      "my story",
      "grateful",
      "thankful",
      "reflection",
      "life",
      "family",
      "motivation",
      "mindset",
    ],
  },
];

const DOMAIN_LABELS: Record<ContentDomainKey, string> = Object.fromEntries(
  CONTENT_DOMAINS.map((d) => [d.key, d.label]),
) as Record<ContentDomainKey, string>;

export function domainLabel(key: ContentDomainKey): string {
  return DOMAIN_LABELS[key] ?? "General";
}

/** Score post text against domain keyword lists; pick best match. */
export function classifyPostDomain(text: string): {
  key: ContentDomainKey;
  label: string;
} {
  const normalized = text.toLowerCase();
  let bestKey: ContentDomainKey = "general";
  let bestScore = 0;

  for (const domain of CONTENT_DOMAINS) {
    let score = 0;
    for (const kw of domain.keywords) {
      if (normalized.includes(kw)) score += 1;
    }
    if (score > bestScore) {
      bestScore = score;
      bestKey = domain.key;
    }
  }

  return {
    key: bestKey,
    label: domainLabel(bestKey),
  };
}
