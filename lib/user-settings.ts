import type { Prisma, User } from "@prisma/client";
import {
  decryptSecret,
  encryptSecret,
  hasEncryptedSecret,
  maskSecret,
} from "@/lib/crypto";
import type { SettingsPatchInput } from "@/lib/validations/settings";
import {
  getActiveDraftProviderKind,
  hasDraftProviderKey,
} from "@/lib/llm/draft-provider";
import type { DraftProviderKind } from "@/lib/llm/models";

export type SettingsResponse = {
  email: string;
  displayName: string;
  timezone: string;
  emailDigest: boolean;
  keys: {
    tavily: boolean;
    firecrawl: boolean;
    openrouter: boolean;
    nvidia: boolean;
  };
  /** Which draft provider will be used (OpenRouter preferred if both keys exist). */
  draftProvider: DraftProviderKind | null;
};

export function toSettingsResponse(user: User): SettingsResponse {
  return {
    email: user.email,
    displayName: user.displayName,
    timezone: user.timezone,
    emailDigest: user.emailDigest,
    keys: {
      tavily: hasEncryptedSecret(user.tavilyApiKey),
      firecrawl: hasEncryptedSecret(user.firecrawlApiKey),
      openrouter: hasEncryptedSecret(user.openrouterKey),
      nvidia: hasEncryptedSecret(user.nvidiaKey),
    },
    draftProvider: getActiveDraftProviderKind(user),
  };
}

export function userNeedsOnboarding(user: User): boolean {
  return !hasDraftProviderKey(user);
}

export function wouldLoseDraftProvider(
  user: User,
  input: SettingsPatchInput,
): boolean {
  const willHaveOpenrouter =
    !input.clearOpenrouter &&
    (Boolean(input.openrouterKey) || hasEncryptedSecret(user.openrouterKey));
  const willHaveNvidia =
    !input.clearNvidia &&
    (Boolean(input.nvidiaKey) || hasEncryptedSecret(user.nvidiaKey));
  return !willHaveOpenrouter && !willHaveNvidia;
}

export function buildSettingsUpdate(
  user: User,
  input: SettingsPatchInput,
): Prisma.UserUpdateInput {
  const data: Prisma.UserUpdateInput = {};

  if (input.timezone !== undefined) {
    data.timezone = input.timezone;
  }
  if (input.emailDigest !== undefined) {
    data.emailDigest = input.emailDigest;
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

  return data;
}

export function getDecryptedKey(
  user: User,
  key: "tavilyApiKey" | "firecrawlApiKey" | "openrouterKey" | "nvidiaKey",
): string | null {
  const value = user[key];
  if (!value) return null;
  return decryptSecret(value);
}

/** For display in forms — never exposes real secret */
export function keyFieldPlaceholder(hasKey: boolean): string {
  return hasKey ? maskSecret("placeholder") ?? "" : "Paste API key";
}
