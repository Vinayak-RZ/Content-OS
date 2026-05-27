import { z } from "zod";

/** Dynamic lookup - Next.js inlines `process.env.FOO` at build time; bracket access reads at runtime. */
function readEnv(key: string): string | undefined {
  return process.env[key];
}

const authEnvSchema = z.object({
  GOOGLE_CLIENT_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
  GOOGLE_CLIENT_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
  NEXTAUTH_SECRET: z
    .string()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters"),
  NEXTAUTH_URL: z.string().url("NEXTAUTH_URL must be a valid URL"),
});

export type AuthEnv = {
  googleClientId: string;
  googleClientSecret: string;
  nextAuthSecret: string;
  nextAuthUrl: string;
};

export function getAuthEnv(): AuthEnv {
  const parsed = authEnvSchema.safeParse({
    GOOGLE_CLIENT_ID: readEnv("GOOGLE_CLIENT_ID"),
    GOOGLE_CLIENT_SECRET: readEnv("GOOGLE_CLIENT_SECRET"),
    NEXTAUTH_SECRET: readEnv("NEXTAUTH_SECRET"),
    NEXTAUTH_URL: readEnv("NEXTAUTH_URL"),
  });

  if (!parsed.success) {
    const message = parsed.error.issues
      .map((issue) => `${String(issue.path[0])}: ${issue.message}`)
      .join("; ");
    throw new Error(`Auth environment invalid: ${message}`);
  }

  const googleClientId = parsed.data.GOOGLE_CLIENT_ID.trim();
  if (googleClientId === "build") {
    throw new Error(
      "GOOGLE_CLIENT_ID is set to the build placeholder. Set real Google OAuth credentials in .env.local",
    );
  }

  return {
    googleClientId,
    googleClientSecret: parsed.data.GOOGLE_CLIENT_SECRET.trim(),
    nextAuthSecret: parsed.data.NEXTAUTH_SECRET,
    nextAuthUrl: parsed.data.NEXTAUTH_URL,
  };
}
