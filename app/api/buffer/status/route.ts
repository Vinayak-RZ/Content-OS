import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { hasBufferConnection } from "@/lib/buffer/credentials";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });

    const [channelCount, postCount] = await Promise.all([
      prisma.bufferChannel.count({ where: { userId: user.id } }),
      prisma.socialPost.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      connected: hasBufferConnection(user),
      organizationId: user.bufferOrganizationId,
      lastSyncAt: user.bufferLastSyncAt?.toISOString() ?? null,
      lastSyncError: user.bufferLastSyncError,
      channelCount,
      postCount,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
