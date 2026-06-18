import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { fetchBufferOrganizations } from "@/lib/buffer/queries";
import { getBufferApiKey } from "@/lib/buffer/credentials";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });

    const apiKey = getBufferApiKey(user);
    if (!apiKey) {
      throw new ApiError("VALIDATION_ERROR", "Buffer API key not configured", 400);
    }

    const organizations = await fetchBufferOrganizations(apiKey);
    return NextResponse.json({ organizations });
  } catch (error) {
    return errorResponse(error);
  }
}
