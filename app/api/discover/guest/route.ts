import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { runDiscoveryForGuest } from "@/lib/discovery/guest-orchestrator";
import {
  assertGuestDiscoverAllowed,
  bumpGuestDiscoverCount,
  readGuestSessionFromRequest,
} from "@/lib/guest/cookie";
import { GUEST_DISCOVER_DAILY_LIMIT } from "@/lib/guest/constants";

export const maxDuration = 300;

/** Manual discovery for guests — results are returned to the client only (not saved). */
export async function POST(req: NextRequest) {
  try {
    if (!(await readGuestSessionFromRequest(req))) {
      throw new ApiError("UNAUTHORIZED", "Guest session required", 401);
    }

    try {
      await assertGuestDiscoverAllowed(req);
    } catch {
      throw new ApiError(
        "RATE_LIMIT",
        `Guest discovery limit reached (${GUEST_DISCOVER_DAILY_LIMIT}/day). Sign in to save topics and run more.`,
        429,
      );
    }

    const result = await runDiscoveryForGuest();
    const res = NextResponse.json({
      newStored: result.newStored,
      carriedOver: 0,
      batchId: result.batchId,
      topics: result.topics,
      sourceCounts: result.sourceCounts,
    });
    await bumpGuestDiscoverCount(res, req);
    return res;
  } catch (error) {
    return errorResponse(error);
  }
}
