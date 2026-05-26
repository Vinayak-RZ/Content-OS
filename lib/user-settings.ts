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
import type { SettingsPatchInput } from "@/lib/validations/settings";

export type SettingsResponse = {
  email: string;
  displayName: string;
  timezone: string;
  emailDigest: boolean;
  onboardingCompleted: boolean;
  keys: {
    tavily: boolean;
    firecrawl: boolean;
    openrouter: boolean;
    nvidia: boolean;
    openai: boolean;
  };
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
    keys: {
      tavily: hasEncryptedSecret(user.tavilyApiKey),
      firecrawl: hasEncryptedSecret(user.firecrawlApiKey),
      openrouter: hasEncryptedSecret(user.openrouterKey),
      nvidia: hasEncryptedSecret(user.nvidiaKey),
      openai: hasEncryptedSecret(user.openaiKey),
    },
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

  return data;
}

export function getDecryptedKey(
  user: User,
  key:
    | "tavilyApiKey"
    | "firecrawlApiKey"
    | "openrouterKey"
    | "nvidiaKey"
    | "openaiKey",
): string | null {
  const value = user[key];
  if (!value) return null;
  return decryptSecret(value);
}

/** For display in forms — never exposes real secret */
export function keyFieldPlaceholder(hasKey: boolean): string {
  return hasKey ? maskSecret("placeholder") ?? "" : "Paste API key";
}
