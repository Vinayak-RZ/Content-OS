import type { Prisma, User } from "@prisma/client";
import {
  decryptSecret,
  encryptSecret,
  hasEncryptedSecret,
  maskSecret,
} from "@/lib/crypto";
import {
  getActiveDraftProviderKind,
  resolveDraftProvider,
} from "@/lib/llm/draft-provider";
import {
  type DraftProviderKind,
  getDefaultModelId,
  isValidDraftModel,
} from "@/lib/llm/models";
import type { PersonaType } from "@/lib/personas/types";
import { isPersonaType } from "@/lib/personas/types";
import type { SettingsPatchInput } from "@/lib/validations/settings";
import { fetchBufferOrganizations } from "@/lib/buffer/queries";
import { BufferApiError } from "@/lib/buffer/client";

export type SettingsResponse = {
  email: string;
  displayName: string;
  timezone: string;
  emailDigest: boolean;
  onboardingCompleted: boolean;
  personaType: PersonaType | null;
  personaCustom: string | null;
  keys: {
    tavily: boolean;
    firecrawl: boolean;
    openrouter: boolean;
    nvidia: boolean;
    openai: boolean;
    buffer: boolean;
  };
  bufferOrganizationId: string | null;
  bufferLastSyncAt: string | null;
  bufferLastSyncError: string | null;
  draftProvider: DraftProviderKind | null;
  draftModelId: string | null;
  /** Resolved provider when keys allow (preference + fallback). */
  activeDraftProvider: DraftProviderKind | null;
  activeModelId: string | null;
  activeModelDisplayName: string | null;
};

export function toSettingsResponse(user: User): SettingsResponse {
  const resolved = resolveDraftProvider(user);
  const preferred = user.draftProvider as DraftProviderKind | null;
  const draftModelId =
    user.draftModelId ??
    (preferred ? getDefaultModelId(preferred) : null);

  return {
    email: user.email,
    displayName: user.displayName,
    timezone: user.timezone,
    emailDigest: user.emailDigest,
    onboardingCompleted: Boolean(user.onboardingCompletedAt),
    personaType:
      user.personaType && isPersonaType(user.personaType)
        ? user.personaType
        : null,
    personaCustom: user.personaCustom ?? null,
    keys: {
      tavily: hasEncryptedSecret(user.tavilyApiKey),
      firecrawl: hasEncryptedSecret(user.firecrawlApiKey),
      openrouter: hasEncryptedSecret(user.openrouterKey),
      nvidia: hasEncryptedSecret(user.nvidiaKey),
      openai: hasEncryptedSecret(user.openaiKey),
      buffer: hasEncryptedSecret(user.bufferApiKey),
    },
    bufferOrganizationId: user.bufferOrganizationId ?? null,
    bufferLastSyncAt: user.bufferLastSyncAt?.toISOString() ?? null,
    bufferLastSyncError: user.bufferLastSyncError ?? null,
    draftProvider: (user.draftProvider as DraftProviderKind | null) ?? null,
    draftModelId,
    activeDraftProvider: getActiveDraftProviderKind(user),
    activeModelId: resolved?.modelId ?? null,
    activeModelDisplayName: resolved?.displayName ?? null,
  };
}

export function userNeedsOnboarding(user: User): boolean {
  return !user.onboardingCompletedAt;
}

export function validateDraftProviderSettings(
  user: User,
  input: SettingsPatchInput,
): void {
  const provider =
    input.draftProvider ??
    (user.draftProvider as DraftProviderKind | undefined);
  const modelId = input.draftModelId ?? user.draftModelId ?? undefined;

  if (input.draftModelId && !provider) {
    throw new Error("Select a draft provider before choosing a model.");
  }
  if (provider && modelId && !isValidDraftModel(provider, modelId)) {
    throw new Error(`Invalid model for ${provider}.`);
  }
}

export function buildSettingsUpdate(
  user: User,
  input: SettingsPatchInput,
): Prisma.UserUpdateInput {
  validateDraftProviderSettings(user, input);

  const data: Prisma.UserUpdateInput = {};

  if (input.timezone !== undefined) {
    data.timezone = input.timezone;
  }
  if (input.emailDigest !== undefined) {
    data.emailDigest = input.emailDigest;
  }
  if (input.onboardingCompleted === true) {
    data.onboardingCompletedAt = new Date();
  }
  if (input.personaType !== undefined) {
    data.personaType = input.personaType;
    if (input.personaType !== "other") {
      data.personaCustom = null;
    }
  }
  if (input.personaCustom !== undefined) {
    data.personaCustom = input.personaCustom?.trim() || null;
  }
  if (input.draftProvider !== undefined) {
    data.draftProvider = input.draftProvider;
    if (!input.draftModelId) {
      data.draftModelId = getDefaultModelId(input.draftProvider);
    }
  }
  if (input.draftModelId !== undefined) {
    data.draftModelId = input.draftModelId;
  }
  if (input.clearTavily) {
    data.tavilyApiKey = null;
  } else if (input.tavilyApiKey) {
    data.tavilyApiKey = encryptSecret(input.tavilyApiKey);
  }
  if (input.clearFirecrawl) {
    data.firecrawlApiKey = null;
  } else if (input.firecrawlApiKey) {
    data.firecrawlApiKey = encryptSecret(input.firecrawlApiKey);
  }
  if (input.clearOpenrouter) {
    data.openrouterKey = null;
  } else if (input.openrouterKey) {
    data.openrouterKey = encryptSecret(input.openrouterKey);
  }
  if (input.clearNvidia) {
    data.nvidiaKey = null;
  } else if (input.nvidiaKey) {
    data.nvidiaKey = encryptSecret(input.nvidiaKey);
  }
  if (input.clearOpenai) {
    data.openaiKey = null;
  } else if (input.openaiKey) {
    data.openaiKey = encryptSecret(input.openaiKey);
  }
  if (input.clearBuffer) {
    data.bufferApiKey = null;
    data.bufferOrganizationId = null;
    data.bufferLastSyncAt = null;
    data.bufferLastSyncError = null;
  } else if (input.bufferApiKey) {
    data.bufferApiKey = encryptSecret(input.bufferApiKey);
  }
  if (input.bufferOrganizationId !== undefined) {
    data.bufferOrganizationId = input.bufferOrganizationId || null;
  }

  return data;
}

export async function validateBufferSettings(
  user: User,
  input: SettingsPatchInput,
  data: Prisma.UserUpdateInput,
): Promise<void> {
  const nextKey =
    input.bufferApiKey != null
      ? input.bufferApiKey
      : input.clearBuffer
        ? null
        : user.bufferApiKey
          ? decryptSecret(user.bufferApiKey)
          : null;

  if (!nextKey) return;

  try {
    const orgs = await fetchBufferOrganizations(nextKey);
    if (orgs.length === 0) {
      throw new Error("Buffer API key is valid but no organizations were found.");
    }

    const requestedOrg = input.bufferOrganizationId ?? user.bufferOrganizationId;
    if (requestedOrg && !orgs.some((o) => o.id === requestedOrg)) {
      throw new Error("Selected Buffer organization is not available for this key.");
    }

    if (!requestedOrg && orgs.length === 1) {
      data.bufferOrganizationId = orgs[0]!.id;
    } else if (!requestedOrg && orgs.length > 1 && input.bufferApiKey) {
      throw new Error(
        "Multiple Buffer organizations found. Select one before saving.",
      );
    }
  } catch (error) {
    if (error instanceof BufferApiError) {
      throw new Error(`Buffer API key validation failed: ${error.message}`);
    }
    throw error;
  }
}

export function getDecryptedKey(
  user: User,
  key:
    | "tavilyApiKey"
    | "firecrawlApiKey"
    | "openrouterKey"
    | "nvidiaKey"
    | "openaiKey"
    | "bufferApiKey",
): string | null {
  const value = user[key];
  if (!value) return null;
  return decryptSecret(value);
}

/** For display in forms - never exposes real secret */
export function keyFieldPlaceholder(hasKey: boolean): string {
  return hasKey ? maskSecret("placeholder") ?? "" : "Paste API key";
}
