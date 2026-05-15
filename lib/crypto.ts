import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { getEncryptionKeyHex } from "@/lib/env";

function getKeyBuffer(): Buffer {
  return Buffer.from(getEncryptionKeyHex(), "hex");
}

/** AES-256-GCM — stored as base64(iv):base64(tag):base64(ciphertext) */
export function encryptSecret(plaintext: string): string {
  const key = getKeyBuffer();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    iv.toString("base64"),
    tag.toString("base64"),
    encrypted.toString("base64"),
  ].join(":");
}

export function decryptSecret(payload: string): string {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload format");
  }
  const key = getKeyBuffer();
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}

export function maskSecret(value: string | null | undefined): string | null {
  if (!value) return null;
  return "••••••••••••••••";
}

export function hasEncryptedSecret(value: string | null | undefined): boolean {
  return Boolean(value && value.includes(":"));
}
