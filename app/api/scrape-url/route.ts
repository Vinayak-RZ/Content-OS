import { NextResponse } from "next/server";
import { z } from "zod";

import { ApiError, errorResponse } from "@/lib/api-error";
import { canonicalizeUrl } from "@/lib/discovery/urls";
import { firecrawlScrapeMarkdown } from "@/lib/discovery/adapters/firecrawl";
import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/session";
import { getDecryptedKey } from "@/lib/user-settings";

const bodySchema = z.object({
  url: z.string().url(),
});

/** Optional Firecrawl enrichment for custom-topic URL pastes. */
export async function POST(request: Request) {
  try {
    const session = await requireSession();
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
    });
    const apiKey = getDecryptedKey(user, "firecrawlApiKey");
    if (!apiKey) {
      throw new ApiError(
        "NO_FIRECRAWL",
        "Add a Firecrawl API key in Settings to fetch URL content.",
        400,
      );
    }

    const body: unknown = await request.json();
    const parsed = bodySchema.safeParse(body);
    if (!parsed.success) {
      throw new ApiError(
        "VALIDATION_ERROR",
        parsed.error.issues.map((i) => i.message).join("; "),
        400,
      );
    }

    const url = canonicalizeUrl(parsed.data.url);
    const markdown = await firecrawlScrapeMarkdown(apiKey, url);
    const md = markdown ?? "";
    const titleMatch = md.match(/^#\s+(.+)$/m);
    const titleGuess = titleMatch?.[1]?.trim();

    return NextResponse.json({
      url,
      titleGuess: titleGuess ?? null,
      markdownPreview: md.slice(0, 6000),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
