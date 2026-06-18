import type { PersonaType } from "@/lib/personas/types";

const SHARED_TAVILY = [
  "thoughtful essay analysis blog",
  "industry news deep dive opinion",
];

export const PERSONA_TAVILY_QUERIES: Record<
  Exclude<PersonaType, "other">,
  string[]
> = {
  student: [
    "computer science research breakthrough explained",
    "internship career tech industry advice",
    "student builder project open source",
    "learning programming systems design blog",
    ...SHARED_TAVILY,
  ],
  founder: [
    "startup product distribution lessons essay",
    "founder building in public insights",
    "YC startup launch analysis",
    "generative AI startup product news",
    ...SHARED_TAVILY,
  ],
  engineer: [
    "OpenAI Anthropic AI model release analysis",
    "LLM inference distributed systems engineering",
    "open source developer tools launch",
    "software architecture technical deep dive",
    ...SHARED_TAVILY,
  ],
  content_creator: [
    "creator economy audience growth strategy",
    "LinkedIn writing storytelling tips analysis",
    "newsletter growth content strategy essay",
    "social media platform algorithm change news",
    ...SHARED_TAVILY,
  ],
  finance: [
    "fintech banking markets analysis news",
    "macro investing thesis essay",
    "earnings market reaction deep dive",
    "venture capital funding fintech insurtech",
    ...SHARED_TAVILY,
  ],
};

export const PERSONA_FIRECRAWL_QUERIES: Record<
  Exclude<PersonaType, "other">,
  string[]
> = {
  student: ["student tech career learning essay blog"],
  founder: ["startup founder product essay analysis"],
  engineer: ["technical analysis engineering infrastructure blog"],
  content_creator: ["creator storytelling audience building essay"],
  finance: ["markets investing fintech analysis essay"],
};

export const DEFAULT_TAVILY_QUERIES = PERSONA_TAVILY_QUERIES.founder;
export const DEFAULT_FIRECRAWL_QUERIES = PERSONA_FIRECRAWL_QUERIES.founder;

const SHARED_X_QUERIES = [
  "viral tweet founder startup site:x.com",
  "trending post AI builders site:x.com",
  "founder building in public site:x.com",
];

export const PERSONA_X_QUERIES: Record<
  Exclude<PersonaType, "other">,
  string[]
> = {
  student: [
    "student builder project launch site:x.com",
    "CS career advice viral site:x.com",
    ...SHARED_X_QUERIES,
  ],
  founder: [
    "viral tweet startup founder site:x.com",
    "YC founder thread site:x.com",
    "building in public milestone site:x.com",
    ...SHARED_X_QUERIES,
  ],
  engineer: [
    "viral tweet AI engineering site:x.com",
    "open source launch site:x.com",
    "LLM infra hot take site:x.com",
    ...SHARED_X_QUERIES,
  ],
  content_creator: [
    "creator growth viral thread site:x.com",
    "LinkedIn creator advice site:x.com",
    ...SHARED_X_QUERIES,
  ],
  finance: [
    "fintech markets viral tweet site:x.com",
    "VC funding news site:x.com",
    ...SHARED_X_QUERIES,
  ],
};

export function getDiscoveryQueries(
  personaType: string | null | undefined,
  personaCustom?: string | null,
): { tavily: string[]; firecrawl: string[]; x: string[] } {
  if (
    personaType &&
    personaType !== "other" &&
    personaType in PERSONA_TAVILY_QUERIES
  ) {
    const key = personaType as Exclude<PersonaType, "other">;
    return {
      tavily: PERSONA_TAVILY_QUERIES[key],
      firecrawl: PERSONA_FIRECRAWL_QUERIES[key],
      x: PERSONA_X_QUERIES[key],
    };
  }

  const custom = personaCustom?.trim();
  if (custom) {
    const q = `${custom} news analysis essay blog`;
    return {
      tavily: [q, `${custom} trends opinion`, ...SHARED_TAVILY],
      firecrawl: [`${custom} analysis essay`],
      x: [`${custom} viral tweet site:x.com`, ...SHARED_X_QUERIES],
    };
  }

  return {
    tavily: DEFAULT_TAVILY_QUERIES,
    firecrawl: DEFAULT_FIRECRAWL_QUERIES,
    x: PERSONA_X_QUERIES.founder,
  };
}
