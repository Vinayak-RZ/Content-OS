import { NextResponse } from "next/server";

import { errorResponse } from "@/lib/api-error";
import { requireSession } from "@/lib/session";
import { fetchTrendsForDashboard } from "@/lib/trends/list";

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 100;

/** Ranked trends for dashboard - excludes dismissed, expired, and topic-memory “covered” URLs. */
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

    const trends = await fetchTrendsForDashboard(userId, limit);

    return NextResponse.json({ trends });
  } catch (error) {
    return errorResponse(error);
  }
}
