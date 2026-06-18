import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { ApiError, errorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { persistDiscoveryRunSnapshot } from "@/lib/discovery/persist-run";
import { consumeStudioGenerateRateLimit } from "@/lib/rate-limit";
import { getSession } from "@/lib/session";
import { runStudioTopicGeneration } from "@/lib/studio/generate-topics";

export const maxDuration = 300;

/** LLM-driven Studio topic ideation from Knowledge. */
export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    await consumeStudioGenerateRateLimit(session.user.id);

    const t0 = Date.now();
    const result = await runStudioTopicGeneration(session.user.id);
    const durationMs = Date.now() - t0;

    await Promise.all([
      prisma.cronLog.create({
        data: {
          userId: session.user.id,
          success: true,
          sourceCounts: result.sourceCounts as unknown as Prisma.InputJsonValue,
          totalDiscovered: result.newStored + result.carriedOver,
          durationMs,
        },
      }),
      persistDiscoveryRunSnapshot(result, durationMs),
    ]);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && !(error instanceof ApiError)) {
      return errorResponse(new ApiError("STUDIO_FAILED", error.message, 400));
    }
    return errorResponse(error);
  }
}
