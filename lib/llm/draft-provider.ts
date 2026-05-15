import type { User } from "@prisma/client";
import { hasEncryptedSecret } from "@/lib/crypto";
import {
  NVIDIA_DRAFT,
  OPENROUTER_DRAFT,
  type DraftProviderKind,
} from "@/lib/llm/models";

export type ResolvedDraftProvider = {
  kind: DraftProviderKind;
  modelId: string;
  displayName: string;
  baseUrl?: string;
};

export function hasDraftProviderKey(user: Pick<User, "openrouterKey" | "nvidiaKey">): boolean {
  return (
    hasEncryptedSecret(user.openrouterKey) || hasEncryptedSecret(user.nvidiaKey)
  );
}

/** OpenRouter wins when both keys are configured. */
export function resolveDraftProvider(
  user: Pick<User, "openrouterKey" | "nvidiaKey">,
): ResolvedDraftProvider | null {
  if (hasEncryptedSecret(user.openrouterKey)) {
    return {
      kind: OPENROUTER_DRAFT.provider,
      modelId: OPENROUTER_DRAFT.modelId,
      displayName: OPENROUTER_DRAFT.displayName,
    };
  }
  if (hasEncryptedSecret(user.nvidiaKey)) {
    return {
      kind: NVIDIA_DRAFT.provider,
      modelId: NVIDIA_DRAFT.modelId,
      displayName: NVIDIA_DRAFT.displayName,
      baseUrl: NVIDIA_DRAFT.baseUrl,
    };
  }
  return null;
}

export function getActiveDraftProviderKind(
  user: Pick<User, "openrouterKey" | "nvidiaKey">,
): DraftProviderKind | null {
  return resolveDraftProvider(user)?.kind ?? null;
}
