import { NextResponse } from "next/server";
import { errorResponse, ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import {
  buildSettingsUpdate,
  toSettingsResponse,
  wouldLoseDraftProvider,
} from "@/lib/user-settings";
import { settingsPatchSchema } from "@/lib/validations/settings";

export async function GET() {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });
    return NextResponse.json(toSettingsResponse(user));
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await requireSession();
    const body: unknown = await request.json();
    const parsed = settingsPatchSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });
    if (wouldLoseDraftProvider(user, parsed.data)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "At least one draft provider key is required (OpenRouter or NVIDIA NIM)",
        400,
      );
    }

    const data = buildSettingsUpdate(user, parsed.data);
    if (Object.keys(data).length === 0) {
      throw new ApiError("VALIDATION_ERROR", "No valid fields to update", 400);
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data,
    });

    return NextResponse.json(toSettingsResponse(updated));
  } catch (error) {
    return errorResponse(error);
  }
}
