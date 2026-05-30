import { readFile } from "fs/promises";
import { join } from "path";

import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import {
  SYSTEM_KNOWLEDGE_FILES,
} from "@/lib/knowledge/constants";
import { createKnowledgeDocument } from "@/lib/knowledge/create";
import { syncKnowledgeFile } from "@/lib/knowledge/sync";

/** Insert missing system files from `seeds/starter/` and chunk + embed each. */
export async function seedKnowledgeFromRepo(userId: string): Promise<{
  created: string[];
  skipped: string[];
}> {
  const created: string[] = [];
  const skipped: string[] = [];

  for (const meta of SYSTEM_KNOWLEDGE_FILES) {
    const existing = await prisma.knowledgeFile.findUnique({
      where: { userId_slug: { userId, slug: meta.slug } },
    });
    if (existing) {
      skipped.push(meta.slug);
      continue;
    }

    let buf: string;
    try {
      buf = await readFile(
        join(process.cwd(), "seeds", "starter", meta.fileName),
        "utf8",
      );
    } catch (e: unknown) {
      const code =
        typeof e === "object" &&
        e !== null &&
        "code" in e &&
        typeof (e as { code?: string }).code === "string"
          ? (e as { code?: string }).code
          : undefined;
      if (code === "ENOENT") {
        throw new ApiError(
          "SEED_UNAVAILABLE",
          `Missing seed file: ${meta.fileName} under seeds/starter/`,
          500,
        );
      }
      throw e;
    }

    await createKnowledgeDocument(userId, {
      slug: meta.slug,
      displayName: meta.displayName,
      role: meta.role,
      content: buf,
      isSystem: true,
      sortOrder: meta.sortOrder,
    });
    created.push(meta.slug);
  }

  return { created, skipped };
}

/** Re-embed a system file from repo template (reset content). */
export async function resetSystemKnowledgeFromRepo(
  userId: string,
  slug: string,
): Promise<void> {
  const meta = SYSTEM_KNOWLEDGE_FILES.find((f) => f.slug === slug);
  if (!meta) {
    throw new ApiError("NOT_FOUND", "Not a system document", 404);
  }
  const buf = await readFile(
    join(process.cwd(), "seeds", "starter", meta.fileName),
    "utf8",
  );
  await syncKnowledgeFile(userId, slug, buf);
}
