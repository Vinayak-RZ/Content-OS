import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { getEnv } from "@/lib/env";
import {
  recordBufferSyncError,
  syncBufferForUser,
} from "@/lib/buffer/sync";
import { prisma } from "@/lib/db";

export const maxDuration = 300;

export async function GET(request: Request) {
  try {
    const env = getEnv();
    const secret = env.CRON_SECRET;
    if (!secret) {
      throw new ApiError("INTERNAL_ERROR", "CRON_SECRET is not configured", 500);
    }

    const auth = request.headers.get("authorization");
    if (auth !== `Bearer ${secret}`) {
      throw new ApiError("UNAUTHORIZED", "Invalid cron secret", 401);
    }

    const users = await prisma.user.findMany({
      where: {
        bufferApiKey: { not: null },
        bufferOrganizationId: { not: null },
      },
      take: 50,
    });

    const results: {
      userId: string;
      ok: boolean;
      postsSynced?: number;
      error?: string;
    }[] = [];

    for (const user of users) {
      try {
        const result = await syncBufferForUser(user);
        results.push({ userId: user.id, ok: true, postsSynced: result.postsSynced });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Buffer sync failed";
        await recordBufferSyncError(user.id, message);
        results.push({ userId: user.id, ok: false, error: message });
      }
    }

    return NextResponse.json({
      processed: results.length,
      results,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
