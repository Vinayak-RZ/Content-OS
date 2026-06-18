import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, errorResponse } from "@/lib/api-error";
import { requireSession } from "@/lib/session";
import { createStudioCustomTopic } from "@/lib/studio/generate-topics";

const bodySchema = z.object({
  prompt: z.string().min(8).max(2000),
});

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body: unknown = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const result = await createStudioCustomTopic(
      session.user.id,
      parsed.data.prompt,
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error && !(error instanceof ApiError)) {
      return errorResponse(new ApiError("STUDIO_FAILED", error.message, 400));
    }
    return errorResponse(error);
  }
}
