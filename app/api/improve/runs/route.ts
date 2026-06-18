import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { listImprovementRuns } from "@/lib/improvement/run";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    const runs = await listImprovementRuns(session.user.id);
    return NextResponse.json({ runs });
  } catch (error) {
    return errorResponse(error);
  }
}
