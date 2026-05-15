import { NextResponse } from "next/server";
import { errorResponse } from "@/lib/api-error";
import { seedKnowledgeFromRepo } from "@/lib/knowledge/seed";
import { requireSession } from "@/lib/session";

export async function POST() {
  try {
    const session = await requireSession();
    const result = await seedKnowledgeFromRepo(session.user.id);
    return NextResponse.json(result);
  } catch (error) {
    return errorResponse(error);
  }
}
