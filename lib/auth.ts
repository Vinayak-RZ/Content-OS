import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getAuthEnv } from "@/lib/auth-env";
import { prisma } from "@/lib/db";
import { hasDraftProviderKey } from "@/lib/llm/draft-provider";

export function getAuthOptions(): NextAuthOptions {
  const authEnv = getAuthEnv();

  return {
    providers: [
      GoogleProvider({
        clientId: authEnv.googleClientId,
        clientSecret: authEnv.googleClientSecret,
      }),
    ],
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60,
    },
    pages: {
      signIn: "/login",
      error: "/login",
    },
    callbacks: {
      async signIn({ user }) {
        if (!user.email) {
          return false;
        }
        await prisma.user.upsert({
          where: { email: user.email },
          create: {
            email: user.email,
            displayName: user.name ?? user.email.split("@")[0] ?? "User",
          },
          update: {
            displayName: user.name ?? undefined,
          },
        });
        return true;
      },
      async jwt({ token, user, trigger }) {
        const email = token.email ?? user?.email;
        if (!email) {
          return token;
        }
        if (user || trigger === "update" || !token.sub) {
          const dbUser = await prisma.user.findUnique({
            where: { email },
            select: {
              id: true,
              displayName: true,
              openrouterKey: true,
              nvidiaKey: true,
              tavilyApiKey: true,
            },
          });
          if (dbUser) {
            token.sub = dbUser.id;
            token.name = dbUser.displayName;
            token.hasDraftProviderKey = hasDraftProviderKey(dbUser);
            token.hasTavilyKey = Boolean(dbUser.tavilyApiKey);
          }
        }
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub ?? "";
          session.user.hasDraftProviderKey = Boolean(token.hasDraftProviderKey);
          session.user.hasTavilyKey = Boolean(token.hasTavilyKey);
        }
        return session;
      },
      async redirect({ url, baseUrl }) {
        if (url.startsWith("/")) {
          return `${baseUrl}${url}`;
        }
        if (new URL(url).origin === baseUrl) {
          return url;
        }
        return `${baseUrl}/dashboard`;
      },
    },
    secret: authEnv.nextAuthSecret,
  };
}
