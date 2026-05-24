/** Draft generation providers and selectable models. */

export const DRAFT_PROVIDER_KINDS = ["openrouter", "openai", "nvidia"] as const;
export type DraftProviderKind = (typeof DRAFT_PROVIDER_KINDS)[number];

export type DraftModelOption = {
  modelId: string;
  displayName: string;
};

export const DRAFT_PROVIDER_LABELS: Record<DraftProviderKind, string> = {
  openrouter: "OpenRouter",
  openai: "OpenAI",
  nvidia: "NVIDIA NIM",
};

/** Curated models per provider (OpenAI-compatible APIs). */
export const DRAFT_MODEL_CATALOG: Record<
  DraftProviderKind,
  readonly DraftModelOption[]
> = {
  openrouter: [
    { modelId: "x-ai/grok-4.3", displayName: "Grok 4.3" },
    { modelId: "anthropic/claude-sonnet-4", displayName: "Claude Sonnet 4" },
    { modelId: "google/gemini-2.5-pro-preview", displayName: "Gemini 2.5 Pro" },
    { modelId: "openai/gpt-4o", displayName: "GPT-4o (via OpenRouter)" },
  ],
  openai: [
    { modelId: "gpt-4o", displayName: "GPT-4o" },
    { modelId: "gpt-4o-mini", displayName: "GPT-4o mini" },
    { modelId: "gpt-4.1", displayName: "GPT-4.1" },
    { modelId: "gpt-4.1-mini", displayName: "GPT-4.1 mini" },
  ],
  nvidia: [
    {
      modelId: "qwen/qwen3-coder-480b-a35b-instruct",
      displayName: "Qwen3-Coder-480B",
    },
    { modelId: "meta/llama-3.3-70b-instruct", displayName: "Llama 3.3 70B" },
  ],
};

export const NVIDIA_API_BASE = "https://integrate.api.nvidia.com/v1";
export const OPENAI_API_BASE = "https://api.openai.com/v1";
export const OPENROUTER_API_BASE = "https://openrouter.ai/api/v1";

export function getDefaultModelId(kind: DraftProviderKind): string {
  const first = DRAFT_MODEL_CATALOG[kind][0];
  if (!first) {
    throw new Error(`No models configured for ${kind}`);
  }
  return first.modelId;
}

export function getModelOption(
  kind: DraftProviderKind,
  modelId: string,
): DraftModelOption | undefined {
  return DRAFT_MODEL_CATALOG[kind].find((m) => m.modelId === modelId);
}

export function isValidDraftModel(
  kind: DraftProviderKind,
  modelId: string,
): boolean {
  return Boolean(getModelOption(kind, modelId));
}

/** @deprecated Use DRAFT_MODEL_CATALOG */
export const NVIDIA_DRAFT = {
  provider: "nvidia" as const,
  modelId: getDefaultModelId("nvidia"),
  displayName: DRAFT_MODEL_CATALOG.nvidia[0]!.displayName,
  baseUrl: NVIDIA_API_BASE,
} as const;

/** @deprecated Use DRAFT_MODEL_CATALOG */
export const OPENROUTER_DRAFT = {
  provider: "openrouter" as const,
  modelId: getDefaultModelId("openrouter"),
  displayName: DRAFT_MODEL_CATALOG.openrouter[0]!.displayName,
} as const;
