import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { hasBufferConnection } from "@/lib/buffer/credentials";
import { syncBufferForUser } from "@/lib/buffer/sync";
import { serviceLabel } from "@/lib/buffer/types";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });

    if (!hasBufferConnection(user)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Connect Buffer in Settings first.",
        400,
      );
    }

    const refresh = new URL(request.url).searchParams.get("refresh") === "1";
    if (refresh) {
      await syncBufferForUser(user);
    }

    const channels = await prisma.bufferChannel.findMany({
      where: {
        userId: user.id,
        service: { in: ["linkedin", "twitter"] },
      },
      orderBy: [{ service: "asc" }, { name: "asc" }],
    });

    return NextResponse.json({
      channels: channels.map((ch) => ({
        id: ch.id,
        service: ch.service,
        platform: serviceLabel(ch.service),
        name: ch.displayName ?? ch.name,
        avatar: ch.avatar,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
