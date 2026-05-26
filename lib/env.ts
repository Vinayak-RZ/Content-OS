import { z } from "zod";

/** Bracket access so Next does not inline missing env at build time. */
function envVar(key: string): string | undefined {
  return process.env[key];
}

/** AES-256-GCM key only — used by `lib/crypto.ts` so encrypt/decrypt does not pull the full env gate. */
export function getEncryptionKeyHex(): string {
  const raw = envVar("ENCRYPTION_KEY");
  const parsed = z
    .string()
    .length(64, "ENCRYPTION_KEY must be a 32-byte hex string (64 chars)")
    .safeParse(raw);
  if (!parsed.success) {
    const msg = parsed.error.issues.map((i) => i.message).join("; ");
    throw new Error(`Invalid ENCRYPTION_KEY:\n${msg}`);
  }
  return parsed.data;
}

const emptyToUndefined = (v: unknown) =>
  typeof v === "string" && v.trim() === "" ? undefined : v;

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().min(1, "DIRECT_URL is required"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  ENCRYPTION_KEY: z
    .string()
    .length(64, "ENCRYPTION_KEY must be a 32-byte hex string (64 chars)"),
  /** Embeddings (Phase 2 knowledge chunks, discovery scoring). Not used for draft generation (OpenRouter/NVIDIA). */
  OPENAI_API_KEY: z.preprocess(emptyToUndefined, z.string().min(1).optional()),
  RESEND_API_KEY: z.string().optional(),
  RESEND_FROM_EMAIL: z.string().email().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  GITHUB_TOKEN: z.string().optional(),
  REDDIT_CLIENT_ID: z.string().optional(),
  REDDIT_CLIENT_SECRET: z.string().optional(),
});

export type Env = z.infer<typeof envSchema>;

/** Call from embedding pipelines only — fails fast if unset. */
export function requireOpenAiApiKey(): string {
  const key =
    typeof process.env["OPENAI_API_KEY"] === "string"
      ? process.env["OPENAI_API_KEY"].trim()
      : "";
  if (!key) {
    throw new Error(
      "OPENAI_API_KEY is required for embeddings (Phase 2). Set it in .env.local",
    );
  }
  return key;
}

let cachedEnv: Env | null = null;

export function getEnv(): Env {
  if (cachedEnv) {
    return cachedEnv;
  }
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join("\n");
    throw new Error(`Invalid environment variables:\n${message}`);
  }
  cachedEnv = parsed.data;
  return cachedEnv;
}

export function getEnvOrNull(): Env | null {
  const parsed = envSchema.safeParse(process.env);
  return parsed.success ? parsed.data : null;
}
