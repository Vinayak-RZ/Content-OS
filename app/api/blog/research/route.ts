import { NextResponse } from "next/server";

import { ApiError, errorResponse } from "@/lib/api-error";
import { researchBlogSources } from "@/lib/blogs/research";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getDecryptedKey } from "@/lib/user-settings";
import { blogResearchBodySchema } from "@/lib/validations/blog";

export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const body: unknown = await request.json();
    const parsed = blogResearchBodySchema.safeParse(body);
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

    const tavilyApiKey = getDecryptedKey(user, "tavilyApiKey");
    const firecrawlApiKey = getDecryptedKey(user, "firecrawlApiKey");

    if (!tavilyApiKey && !firecrawlApiKey && parsed.data.seedUrls.length === 0) {
      throw new ApiError(
        "NO_RESEARCH_KEYS",
        "Add a Tavily or Firecrawl API key in Settings, or paste at least one source URL.",
        400,
      );
    }

    const sources = await researchBlogSources({
      title: parsed.data.title,
      seedUrls: parsed.data.seedUrls,
      tavilyApiKey,
      firecrawlApiKey,
    });

    return NextResponse.json({ sources });
  } catch (error) {
    return errorResponse(error);
  }
}
