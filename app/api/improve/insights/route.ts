import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { listAgentInsightFiles } from "@/lib/knowledge/agent-insight";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    const files = await listAgentInsightFiles(session.user.id);
    return NextResponse.json({ files });
  } catch (error) {
    return errorResponse(error);
  }
}
