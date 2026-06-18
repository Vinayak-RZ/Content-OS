import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { hasBufferConnection } from "@/lib/buffer/credentials";
import {
  recordBufferSyncError,
  syncBufferForUser,
} from "@/lib/buffer/sync";
import { prisma } from "@/lib/db";
import { consumeBufferSyncRateLimit } from "@/lib/rate-limit";
import { requireSession } from "@/lib/session";

export const maxDuration = 300;

export async function POST() {
  try {
    const session = await requireSession();
    await consumeBufferSyncRateLimit(session.user.id);

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });

    if (!hasBufferConnection(user)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Connect Buffer in Settings before syncing.",
        400,
      );
    }

    try {
      const result = await syncBufferForUser(user);
      return NextResponse.json(result);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Buffer sync failed";
      await recordBufferSyncError(user.id, message);
      throw new ApiError("BUFFER_SYNC_ERROR", message, 502);
    }
  } catch (error) {
    return errorResponse(error);
  }
}
