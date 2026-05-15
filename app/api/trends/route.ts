import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { isTrendActiveForDashboard } from "@/lib/discovery/carry-over";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getExcludedUrlHashesForDashboard } from "@/lib/topic-memory";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/** Ranked trends for dashboard — excludes dismissed, expired, and topic-memory “covered” URLs. */
export async function GET(request: Request) {
  try {
    const session = await requireSession();
    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const rawLimit = searchParams.get("limit");
    const limit = Math.min(
      MAX_LIMIT,
      Math.max(
        1,
        rawLimit ? Number.parseInt(rawLimit, 10) || DEFAULT_LIMIT : DEFAULT_LIMIT,
      ),
    );

    const now = new Date();
    const excludeHashes = await getExcludedUrlHashesForDashboard(userId);
    const excludeArr = Array.from(excludeHashes);

    const rows = await prisma.trend.findMany({
      where: {
        userId,
        feedbackStatus: { not: "dismissed" },
        OR: [
          { expiresAt: { gt: now } },
          {
            AND: [
              { feedbackStatus: "saved" },
              { savedUntil: { gt: now } },
            ],
          },
        ],
        ...(excludeArr.length > 0 ? { urlHash: { notIn: excludeArr } } : {}),
      },
      orderBy: [{ finalScore: "desc" }, { discoveredAt: "desc" }],
      take: limit,
      select: {
        id: true,
        title: true,
        source: true,
        url: true,
        summary: true,
        trendScore: true,
        finalScore: true,
        tags: true,
        sourceType: true,
        discoveredAt: true,
        expiresAt: true,
        feedbackStatus: true,
        feedbackAt: true,
        savedUntil: true,
        discoveryBatchId: true,
      },
    });

    const trends = rows.filter((t) => isTrendActiveForDashboard(t, now));

    return NextResponse.json({ trends });
  } catch (error) {
    return errorResponse(error);
  }
}
