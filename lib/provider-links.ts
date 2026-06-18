/** Signup / API key pages for providers shown in Settings and onboarding. */
export type ProviderLinkKey =
  | "openrouter"
  | "openai"
  | "nvidia"
  | "tavily"
  | "firecrawl"
  | "buffer";

export type ProviderLink = {
  label: string;
  signupUrl: string;
  signupLabel: string;
  blurb: string;
};

export const PROVIDER_LINKS: Record<ProviderLinkKey, ProviderLink> = {
  openrouter: {
    label: "OpenRouter",
    signupUrl: "https://openrouter.ai/keys",
    signupLabel: "Get an OpenRouter key",
    blurb: "One key for many models - good default for draft generation.",
  },
  openai: {
    label: "OpenAI",
    signupUrl: "https://platform.openai.com/api-keys",
    signupLabel: "Get an OpenAI key",
    blurb: "Direct access to GPT models for drafts.",
  },
  nvidia: {
    label: "NVIDIA NIM",
    signupUrl: "https://build.nvidia.com/",
    signupLabel: "Get an NVIDIA NIM key",
    blurb: "NVIDIA-hosted models via NIM - create a key in the build portal.",
  },
  tavily: {
    label: "Tavily",
    signupUrl: "https://tavily.com",
    signupLabel: "Sign up for Tavily",
    blurb: "Web search for topic discovery - optional but improves results.",
  },
  firecrawl: {
    label: "Firecrawl",
    signupUrl: "https://www.firecrawl.dev/app/api-keys",
    signupLabel: "Get a Firecrawl key",
    blurb: "Scrape URLs when you paste a custom topic link on the dashboard.",
  },
  buffer: {
    label: "Buffer",
    signupUrl: "https://publish.buffer.com/settings/api",
    signupLabel: "Get a Buffer API key",
    blurb: "Sync LinkedIn and X metrics and publish drafts to your channels.",
  },
};
