import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { runDiscoveryForUser } from "@/lib/discovery/orchestrator";
import { ApiError, errorResponse } from "@/lib/api-error";
import { getSession } from "@/lib/session";

export const maxDuration = 300;

/** Manual discovery for the signed-in user. */
export async function POST() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    const t0 = Date.now();
    const result = await runDiscoveryForUser(session.user.id);
    await prisma.cronLog.create({
      data: {
        userId: session.user.id,
        success: true,
        sourceCounts: result.sourceCounts as unknown as Prisma.InputJsonValue,
        totalDiscovered: result.newStored + result.carriedOver,
        durationMs: Date.now() - t0,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
