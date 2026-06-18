import type { User } from "@prisma/client";

import { decryptSecret } from "@/lib/crypto";

export type BufferCredentials = {
  apiKey: string;
  organizationId: string;
};

export function getBufferApiKey(user: User): string | null {
  if (!user.bufferApiKey) return null;
  return decryptSecret(user.bufferApiKey);
}

export function hasBufferConnection(user: User): boolean {
  return Boolean(user.bufferApiKey && user.bufferOrganizationId);
}

export function requireBufferCredentials(user: User): BufferCredentials {
  const apiKey = getBufferApiKey(user);
  if (!apiKey) {
    throw new Error("Buffer API key is not configured. Add it in Settings.");
  }
  if (!user.bufferOrganizationId) {
    throw new Error(
      "Buffer organization is not selected. Save your API key and choose an organization in Settings.",
    );
  }
  return { apiKey, organizationId: user.bufferOrganizationId };
}
