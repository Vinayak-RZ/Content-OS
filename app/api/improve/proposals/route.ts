import { NextRequest, NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { listProposals } from "@/lib/improvement/proposals";
import { getSession } from "@/lib/session";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    const status = req.nextUrl.searchParams.get("status") ?? undefined;
    const proposals = await listProposals(session.user.id, status);
    return NextResponse.json({ proposals });
  } catch (error) {
    return errorResponse(error);
  }
}
