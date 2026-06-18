import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { ApiError, errorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { runImprovementForUser } from "@/lib/improvement/run";
import { consumeImproveRateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";

export const maxDuration = 300;

export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    await consumeImproveRateLimit(session.user.id);

    const t0 = Date.now();
    const result = await runImprovementForUser(session.user.id);
    const durationMs = Date.now() - t0;

    await prisma.cronLog.create({
      data: {
        userId: session.user.id,
        success: true,
        sourceCounts: { improve: 1 } as unknown as Prisma.InputJsonValue,
        totalDiscovered: result.summary.stats.postsAnalyzed,
        durationMs,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
