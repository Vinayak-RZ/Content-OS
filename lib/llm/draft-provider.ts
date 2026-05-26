import type { User } from "@prisma/client";
import { ApiError } from "@/lib/api-error";
import { hasEncryptedSecret } from "@/lib/crypto";
import {
  DRAFT_PROVIDER_KINDS,
  DRAFT_PROVIDER_LABELS,
  type DraftProviderKind,
  getDefaultModelId,
  getModelOption,
  isValidDraftModel,
} from "@/lib/llm/models";
import { getDecryptedKey } from "@/lib/user-settings";

export type ResolvedDraftProvider = {
  kind: DraftProviderKind;
  modelId: string;
  displayName: string;
};

export type DraftProviderUser = Pick<
  User,
  | "openrouterKey"
  | "nvidiaKey"
  | "openaiKey"
  | "draftProvider"
  | "draftModelId"
>;

const FALLBACK_ORDER: DraftProviderKind[] = [
  "openrouter",
  "openai",
  "nvidia",
];

export function hasProviderKey(
  user: DraftProviderUser,
  kind: DraftProviderKind,
): boolean {
  switch (kind) {
    case "openrouter":
      return hasEncryptedSecret(user.openrouterKey);
    case "nvidia":
      return hasEncryptedSecret(user.nvidiaKey);
    case "openai":
      return hasEncryptedSecret(user.openaiKey);
    default:
      return false;
  }
}

export function hasDraftProviderKey(user: DraftProviderUser): boolean {
  return DRAFT_PROVIDER_KINDS.some((k) => hasProviderKey(user, k));
}

function parseStoredProvider(
  value: string | null | undefined,
): DraftProviderKind | null {
  if (!value) return null;
  return (DRAFT_PROVIDER_KINDS as readonly string[]).includes(value)
    ? (value as DraftProviderKind)
    : null;
}

function resolveModelForKind(
  kind: DraftProviderKind,
  draftModelId: string | null | undefined,
): { modelId: string; displayName: string } {
  const stored = draftModelId?.trim();
  if (stored && isValidDraftModel(kind, stored)) {
    const opt = getModelOption(kind, stored)!;
    return { modelId: opt.modelId, displayName: opt.displayName };
  }
  const modelId = getDefaultModelId(kind);
  const opt = getModelOption(kind, modelId);
  return {
    modelId,
    displayName: opt?.displayName ?? modelId,
  };
}

/** Resolve provider + model from user prefs and configured keys. */
export function resolveDraftProvider(
  user: DraftProviderUser,
): ResolvedDraftProvider | null {
  const preferred = parseStoredProvider(user.draftProvider);

  const tryKind = (kind: DraftProviderKind): ResolvedDraftProvider | null => {
    if (!hasProviderKey(user, kind)) return null;
    const { modelId, displayName } = resolveModelForKind(
      kind,
      preferred === kind ? user.draftModelId : undefined,
    );
    return { kind, modelId, displayName };
  };

  if (preferred) {
    const resolved = tryKind(preferred);
    if (resolved) return resolved;
  }

  for (const kind of FALLBACK_ORDER) {
    const resolved = tryKind(kind);
    if (resolved) return resolved;
  }

  return null;
}

export function getActiveDraftProviderKind(
  user: DraftProviderUser,
): DraftProviderKind | null {
  return resolveDraftProvider(user)?.kind ?? null;
}

export function getDecryptedDraftApiKey(
  user: User,
  kind: DraftProviderKind,
): string | null {
  switch (kind) {
    case "openrouter":
      return getDecryptedKey(user, "openrouterKey");
    case "nvidia":
      return getDecryptedKey(user, "nvidiaKey");
    case "openai":
      return getDecryptedKey(user, "openaiKey");
    default:
      return null;
  }
}

const SETTINGS_HINT =
  "Add the API key for your chosen provider in Settings (/settings).";

/**
 * Resolve draft provider + decrypted API key, or throw a user-facing error.
 */
export function requireDraftProviderAuth(user: User): {
  provider: ResolvedDraftProvider;
  apiKey: string;
} {
  const provider = resolveDraftProvider(user);
  if (!provider) {
    const preferred = parseStoredProvider(user.draftProvider);
    if (preferred) {
      const label = DRAFT_PROVIDER_LABELS[preferred];
      throw new ApiError(
        "NO_LLM_KEY",
        `You selected ${label} for draft generation but no ${label} API key is saved. ${SETTINGS_HINT}`,
        400,
      );
    }
    throw new ApiError(
      "NO_LLM_KEY",
      `No draft API key configured. ${SETTINGS_HINT} You can use OpenRouter, OpenAI, or NVIDIA NIM.`,
      400,
    );
  }

  const apiKey = getDecryptedDraftApiKey(user, provider.kind);
  if (!apiKey) {
    throw new ApiError(
      "NO_LLM_KEY",
      `Draft provider key missing for ${DRAFT_PROVIDER_LABELS[provider.kind]}. ${SETTINGS_HINT}`,
      400,
    );
  }

  return { provider, apiKey };
}
