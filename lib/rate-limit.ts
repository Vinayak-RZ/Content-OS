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

async function consumeWithinLimit(
  userId: string,
  kind: string,
  windowKey: string,
  limit: number,
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const row = await tx.usageCounter.findUnique({
      where: {
        userId_kind_windowKey: { userId, kind, windowKey },
      },
    });
    const current = row?.count ?? 0;
    if (current >= limit) {
      throw new ApiError(
        "RATE_LIMIT",
        kind === KIND_GENERATE
          ? `Generate limit reached (${limit}/hour). Try again soon.`
          : `Manual discovery limit reached (${limit}/day).`,
        429,
      );
    }
    await tx.usageCounter.upsert({
      where: {
        userId_kind_windowKey: { userId, kind, windowKey },
      },
      create: { userId, kind, windowKey, count: 1 },
      update: { count: { increment: 1 } },
    });
  });
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
