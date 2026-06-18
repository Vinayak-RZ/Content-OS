import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { getImprovementRun } from "@/lib/improvement/run";
import { getSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_req: Request, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    const { id } = await context.params;
    const run = await getImprovementRun(session.user.id, id);
    if (!run) {
      throw new ApiError("NOT_FOUND", "Run not found", 404);
    }

    return NextResponse.json({ run });
  } catch (error) {
    return errorResponse(error);
  }
}
