import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";

export const GENERATE_HOURLY_LIMIT = 20;
export const DISCOVER_MANUAL_DAILY_LIMIT = 5;
export const STUDIO_GENERATE_DAILY_LIMIT = 5;
export const BUFFER_SYNC_MINUTE_LIMIT = 1;

const KIND_GENERATE = "generate_hour";
const KIND_DISCOVER = "discover_day";
const KIND_STUDIO = "studio_day";
const KIND_BUFFER_SYNC = "buffer_sync_minute";
export const IMPROVE_DAILY_LIMIT = 3;

const KIND_IMPROVE = "improve_day";

/** UTC hour bucket `YYYY-MM-DDTHH` */
export function utcHourWindowKey(d = new Date()): string {
  return d.toISOString().slice(0, 13);
}

/** UTC date bucket `YYYY-MM-DD` */
export function utcDayWindowKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function rateLimitMessage(kind: string, limit: number): string {
  if (kind === KIND_GENERATE) {
    return `Generate limit reached (${limit}/hour). Try again soon.`;
  }
  if (kind === KIND_BUFFER_SYNC) {
    return "Buffer sync limit reached (1/min). Try again shortly.";
  }
  if (kind === KIND_STUDIO) {
    return `Studio idea generation limit reached (${limit}/day).`;
  }
  if (kind === KIND_IMPROVE) {
    return `Improvement run limit reached (${limit}/day).`;
  }
  return `Manual discovery limit reached (${limit}/day).`;
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

export async function consumeStudioGenerateRateLimit(
  userId: string,
): Promise<void> {
  await consumeWithinLimit(
    userId,
    KIND_STUDIO,
    utcDayWindowKey(),
    STUDIO_GENERATE_DAILY_LIMIT,
  );
}

function utcMinuteWindowKey(d = new Date()): string {
  return d.toISOString().slice(0, 16);
}

export async function consumeBufferSyncRateLimit(userId: string): Promise<void> {
  await consumeWithinLimit(
    userId,
    KIND_BUFFER_SYNC,
    utcMinuteWindowKey(),
    BUFFER_SYNC_MINUTE_LIMIT,
  );
}

export async function consumeImproveRateLimit(userId: string): Promise<void> {
  await consumeWithinLimit(
    userId,
    KIND_IMPROVE,
    utcDayWindowKey(),
    IMPROVE_DAILY_LIMIT,
  );
}
