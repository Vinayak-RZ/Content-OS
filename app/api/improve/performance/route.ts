import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { analyzePerformance } from "@/lib/improvement/performance";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    const analysis = await analyzePerformance(session.user.id);
    return NextResponse.json(analysis);
  } catch (error) {
    return errorResponse(error);
  }
}
