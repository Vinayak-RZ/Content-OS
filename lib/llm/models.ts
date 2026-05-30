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
    { modelId: "anthropic/claude-sonnet-4", displayName: "Claude Sonnet 4" },
    { modelId: "anthropic/claude-3.7-sonnet", displayName: "Claude 3.7 Sonnet" },
    { modelId: "anthropic/claude-opus-4", displayName: "Claude Opus 4" },
    { modelId: "anthropic/claude-3.5-sonnet", displayName: "Claude 3.5 Sonnet" },
    { modelId: "openai/gpt-4o", displayName: "GPT-4o" },
    { modelId: "openai/gpt-4o-mini", displayName: "GPT-4o mini" },
    { modelId: "openai/o3-mini", displayName: "o3-mini" },
    { modelId: "google/gemini-2.5-pro-preview", displayName: "Gemini 2.5 Pro" },
    {
      modelId: "google/gemini-2.5-flash-preview",
      displayName: "Gemini 2.5 Flash",
    },
    { modelId: "google/gemini-2.0-flash-001", displayName: "Gemini 2.0 Flash" },
    {
      modelId: "meta-llama/llama-3.3-70b-instruct",
      displayName: "Llama 3.3 70B",
    },
    { modelId: "deepseek/deepseek-chat-v3-0324", displayName: "DeepSeek V3" },
    { modelId: "deepseek/deepseek-r1", displayName: "DeepSeek R1" },
    { modelId: "qwen/qwen-2.5-72b-instruct", displayName: "Qwen 2.5 72B" },
    { modelId: "mistralai/mistral-large-2411", displayName: "Mistral Large" },
    { modelId: "x-ai/grok-4.3", displayName: "Grok 4.3" },
  ],
  openai: [
    { modelId: "gpt-4o", displayName: "GPT-4o" },
    { modelId: "gpt-4o-mini", displayName: "GPT-4o mini" },
    { modelId: "gpt-4.1", displayName: "GPT-4.1" },
    { modelId: "gpt-4.1-mini", displayName: "GPT-4.1 mini" },
  ],
  nvidia: [
    {
      modelId: "meta/llama-3.3-70b-instruct",
      displayName: "Llama 3.3 70B",
    },
    {
      modelId: "nvidia/llama-3.3-nemotron-super-49b-v1.5",
      displayName: "Nemotron Super 49B v1.5",
    },
    {
      modelId: "mistralai/mistral-nemotron",
      displayName: "Mistral Nemotron",
    },
    {
      modelId: "deepseek-ai/deepseek-v4-pro",
      displayName: "DeepSeek V4 Pro",
    },
    {
      modelId: "deepseek-ai/deepseek-v4-flash",
      displayName: "DeepSeek V4 Flash",
    },
    {
      modelId: "moonshotai/kimi-k2-instruct",
      displayName: "Kimi K2",
    },
    {
      modelId: "qwen/qwen3-5-122b-a10b",
      displayName: "Qwen 3.5 122B",
    },
    {
      modelId: "qwen/qwen3-next-80b-a3b-instruct",
      displayName: "Qwen3 Next 80B",
    },
    {
      modelId: "qwen/qwen3-coder-480b-a35b-instruct",
      displayName: "Qwen3 Coder 480B",
    },
    {
      modelId: "qwen/qwen2.5-coder-32b-instruct",
      displayName: "Qwen2.5 Coder 32B",
    },
    {
      modelId: "meta/llama-3.1-70b-instruct",
      displayName: "Llama 3.1 70B",
    },
    {
      modelId: "nvidia/nemotron-3-super-120b-a12b",
      displayName: "Nemotron 3 Super 120B",
    },
    {
      modelId: "minimaxai/minimax-m2.7",
      displayName: "MiniMax M2.7",
    },
    {
      modelId: "z-ai/glm4.7",
      displayName: "GLM 4.7",
    },
    {
      modelId: "meta/llama-3.1-8b-instruct",
      displayName: "Llama 3.1 8B (fast)",
    },
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
