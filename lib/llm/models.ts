/** Draft generation via NVIDIA integrate API (OpenAI-compatible). */
export const NVIDIA_DRAFT = {
  provider: "nvidia" as const,
  modelId: "qwen/qwen3-coder-480b-a35b-instruct",
  displayName: "Qwen3-Coder-480B-A35B-Instruct",
  baseUrl: "https://integrate.api.nvidia.com/v1",
  defaultTemperature: 0.7,
  defaultTopP: 0.8,
  defaultMaxTokens: 4096,
} as const;

/** Draft generation via OpenRouter. */
export const OPENROUTER_DRAFT = {
  provider: "openrouter" as const,
  modelId: "x-ai/grok-4.3",
  displayName: "Grok 4.3",
} as const;

export type DraftProviderKind = typeof NVIDIA_DRAFT.provider | typeof OPENROUTER_DRAFT.provider;
