import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { publishDraftToBuffer } from "@/lib/buffer/publish";
import { requireSession } from "@/lib/session";
import { bufferPublishSchema } from "@/lib/validations/buffer";

export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body: unknown = await request.json();
    const parsed = bufferPublishSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    try {
      const result = await publishDraftToBuffer(session.user.id, parsed.data);
      return NextResponse.json(result);
    } catch (error) {
      throw new ApiError(
        "BUFFER_PUBLISH_ERROR",
        error instanceof Error ? error.message : "Publish failed",
        400,
      );
    }
  } catch (error) {
    return errorResponse(error);
  }
}
