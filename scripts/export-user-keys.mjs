/**
 * Decrypt and print all user API keys (org admin CLI).
 *
 * Usage (from content-os/):
 *   node scripts/export-user-keys.mjs
 *   node scripts/export-user-keys.mjs --csv > user-api-keys.csv
 *
 * Requires DATABASE_URL and ENCRYPTION_KEY in .env.local or .env
 */
import { createDecipheriv } from "crypto";
import { readFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvFile(name) {
  const path = resolve(root, name);
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(".env");
loadEnvFile(".env.local");

function getEncryptionKeyHex() {
  const raw = process.env.ENCRYPTION_KEY ?? "";
  if (raw.length !== 64 || !/^[0-9a-fA-F]+$/.test(raw)) {
    throw new Error("ENCRYPTION_KEY must be a 64-char hex string in .env.local");
  }
  return raw;
}

function decryptSecret(payload) {
  const [ivB64, tagB64, dataB64] = payload.split(":");
  if (!ivB64 || !tagB64 || !dataB64) {
    throw new Error("Invalid encrypted payload format");
  }
  const key = Buffer.from(getEncryptionKeyHex(), "hex");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString(
    "utf8",
  );
}

function decryptField(value) {
  if (!value) return null;
  try {
    return decryptSecret(value);
  } catch {
    return null;
  }
}

const prisma = new PrismaClient();
const asCsv = process.argv.includes("--csv");

try {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  const rows = users.map((u) => ({
    email: u.email,
    displayName: u.displayName,
    tavily: decryptField(u.tavilyApiKey),
    firecrawl: decryptField(u.firecrawlApiKey),
    openrouter: decryptField(u.openrouterKey),
    nvidia: decryptField(u.nvidiaKey),
    openai: decryptField(u.openaiKey),
    updatedAt: u.updatedAt.toISOString(),
  }));

  if (asCsv) {
    const escape = (v) => {
      const cell = v ?? "";
      return /[",\n]/.test(cell) ? `"${cell.replace(/"/g, '""')}"` : cell;
    };
    console.log(
      "email,displayName,tavily,firecrawl,openrouter,nvidia,openai,updatedAt",
    );
    for (const row of rows) {
      console.log(
        [
          escape(row.email),
          escape(row.displayName),
          escape(row.tavily),
          escape(row.firecrawl),
          escape(row.openrouter),
          escape(row.nvidia),
          escape(row.openai),
          escape(row.updatedAt),
        ].join(","),
      );
    }
  } else {
    console.log(JSON.stringify({ exportedAt: new Date().toISOString(), users: rows }, null, 2));
  }
} finally {
  await prisma.$disconnect();
}
