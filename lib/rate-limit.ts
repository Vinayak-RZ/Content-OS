import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";

export const GENERATE_HOURLY_LIMIT = 20;
export const DISCOVER_MANUAL_DAILY_LIMIT = 5;

const KIND_GENERATE = "generate_hour";
const KIND_DISCOVER = "discover_day";

/** UTC hour bucket `YYYY-MM-DDTHH` */
export function utcHourWindowKey(d = new Date()): string {
  return d.toISOString().slice(0, 13);
}

/** UTC date bucket `YYYY-MM-DD` */
export function utcDayWindowKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function rateLimitMessage(kind: string, limit: number): string {
  return kind === KIND_GENERATE
    ? `Generate limit reached (${limit}/hour). Try again soon.`
    : `Manual discovery limit reached (${limit}/day).`;
}

/**
 * Increment usage without Prisma interactive `$transaction`.
 * Supabase PgBouncer (port 6543) often cannot start interactive transactions (P2028).
 */
async function consumeWithinLimit(
  userId: string,
  kind: string,
  windowKey: string,
  limit: number,
): Promise<void> {
  const where = {
    userId_kind_windowKey: { userId, kind, windowKey },
  } as const;

  const before = await prisma.usageCounter.findUnique({ where });
  if ((before?.count ?? 0) >= limit) {
    throw new ApiError("RATE_LIMIT", rateLimitMessage(kind, limit), 429);
  }

  await prisma.usageCounter.upsert({
    where,
    create: { userId, kind, windowKey, count: 1 },
    update: { count: { increment: 1 } },
  });

  const after = await prisma.usageCounter.findUnique({ where });
  if ((after?.count ?? 0) > limit) {
    await prisma.usageCounter.update({
      where,
      data: { count: { decrement: 1 } },
    });
    throw new ApiError("RATE_LIMIT", rateLimitMessage(kind, limit), 429);
  }
}

export async function consumeGenerateRateLimit(userId: string): Promise<void> {
  await consumeWithinLimit(
    userId,
    KIND_GENERATE,
    utcHourWindowKey(),
    GENERATE_HOURLY_LIMIT,
  );
}

export async function consumeDiscoverManualRateLimit(
  userId: string,
): Promise<void> {
  await consumeWithinLimit(
    userId,
    KIND_DISCOVER,
    utcDayWindowKey(),
    DISCOVER_MANUAL_DAILY_LIMIT,
  );
}
