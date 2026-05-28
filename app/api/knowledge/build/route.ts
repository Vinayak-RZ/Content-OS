import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import {
  composeKnowledgeFilesFromAnswers,
  hasAnyBuilderAnswer,
} from "@/lib/knowledge/builder-questions";
import { SYSTEM_KNOWLEDGE_FILES } from "@/lib/knowledge/constants";
import { seedKnowledgeFromRepo } from "@/lib/knowledge/seed";
import { syncKnowledgeFile } from "@/lib/knowledge/sync";
import { requireSession } from "@/lib/session";
import { knowledgeBuildSchema } from "@/lib/validations/knowledge-build";

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const userId = session.user.id;

    const body: unknown = await request.json();
    const parsed = knowledgeBuildSchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    if (!hasAnyBuilderAnswer(parsed.data)) {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Answer at least one question to build your knowledge files.",
        400,
      );
    }

    await seedKnowledgeFromRepo(userId);

    const files = composeKnowledgeFilesFromAnswers(parsed.data);
    const updated: string[] = [];

    for (const meta of SYSTEM_KNOWLEDGE_FILES) {
      const content = files[meta.slug as keyof typeof files];
      if (!content) continue;
      await syncKnowledgeFile(userId, meta.slug, content);
      updated.push(meta.slug);
    }

    return NextResponse.json({
      ok: true,
      updated,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
