import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn"]
        : ["error"],
  });
}

function resolvePrismaClient(): PrismaClient {
  const cached = globalForPrisma.prisma;

  // Dev HMR keeps a global singleton; after `prisma generate` adds new models
  // the cached client may lack delegates (e.g. blogPost) until server restart.
  if (
    process.env.NODE_ENV !== "production" &&
    cached &&
    !("blogPost" in cached)
  ) {
    const fresh = createPrismaClient();
    if ("blogPost" in fresh) {
      void cached.$disconnect().catch(() => {});
      globalForPrisma.prisma = fresh;
      return fresh;
    }
  }

  if (cached) return cached;

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }
  return client;
}

export const prisma = resolvePrismaClient();
