import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

/** Covered topics — topic memory engagements for dashboard “published” view. */
export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // published | selected | null=all

    const rows = await prisma.topicEngagement.findMany({
      where: {
        userId: session.user.id,
        ...(status === "published" || status === "selected"
          ? { status }
          : {}),
      },
      orderBy: { selectedAt: "desc" },
      take: 100,
      select: {
        id: true,
        topicTitle: true,
        urlHash: true,
        status: true,
        selectedAt: true,
        publishedAt: true,
        trendId: true,
        draftId: true,
      },
    });

    return NextResponse.json({ engagements: rows });
  } catch (error) {
    return errorResponse(error);
  }
}
