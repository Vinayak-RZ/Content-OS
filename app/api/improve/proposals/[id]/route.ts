import { NextRequest, NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import {
  applyProposal,
  rejectProposal,
} from "@/lib/improvement/proposals";
import { getSession } from "@/lib/session";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const session = await getSession();
    if (!session?.user?.id) {
      throw new ApiError("UNAUTHORIZED", "Sign in required", 401);
    }

    const { id } = await context.params;
    const body = (await req.json()) as { action?: string };
    const action = body.action;

    if (action === "approve") {
      await applyProposal(session.user.id, id);
      return NextResponse.json({ ok: true, status: "applied" });
    }
    if (action === "reject") {
      await rejectProposal(session.user.id, id);
      return NextResponse.json({ ok: true, status: "rejected" });
    }

    throw new ApiError("VALIDATION_ERROR", "action must be approve or reject", 400);
  } catch (error) {
    return errorResponse(error);
  }
}
