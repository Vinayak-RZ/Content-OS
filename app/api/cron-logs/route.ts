import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

const DEFAULT_TAKE = 40;

export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const take = Math.min(
      100,
      Math.max(
        1,
        Number.parseInt(searchParams.get("limit") ?? `${DEFAULT_TAKE}`, 10) ||
          DEFAULT_TAKE,
      ),
    );

    const logs = await prisma.cronLog.findMany({
      where: { userId: session.user.id },
      orderBy: { runAt: "desc" },
      take,
      select: {
        id: true,
        runAt: true,
        success: true,
        sourceCounts: true,
        totalDiscovered: true,
        errorMessage: true,
        durationMs: true,
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    return errorResponse(error);
  }
}
