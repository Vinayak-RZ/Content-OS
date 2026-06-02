/** Edge-safe HMAC-SHA256 (Web Crypto). Used by middleware and Node route handlers. */

let hmacKeyPromise: Promise<CryptoKey> | null = null;

function guestSecret(): string {
  const secret = process.env["NEXTAUTH_SECRET"];
  if (!secret?.trim()) {
    throw new Error("NEXTAUTH_SECRET is required for guest sessions");
  }
  return secret;
}

function getHmacKey(): Promise<CryptoKey> {
  if (!hmacKeyPromise) {
    hmacKeyPromise = crypto.subtle.importKey(
      "raw",
      new TextEncoder().encode(guestSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );
  }
  return hmacKeyPromise;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function signGuestPayload(payload: string): Promise<string> {
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(payload),
  );
  return bytesToBase64Url(new Uint8Array(signature));
}

export async function verifyGuestSignedValue(
  raw: string,
  expectedPayload: string,
): Promise<boolean> {
  const dot = raw.lastIndexOf(".");
  if (dot <= 0) return false;
  const payload = raw.slice(0, dot);
  const sig = raw.slice(dot + 1);
  if (payload !== expectedPayload) return false;
  const expected = await signGuestPayload(expectedPayload);
  return timingSafeEqualStrings(sig, expected);
}
