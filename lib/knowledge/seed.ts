import { readFile } from "fs/promises";
import { join } from "path";

import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import {
  CANONICAL_KNOWLEDGE_FILES,
  KNOWLEDGE_SEED_DIR,
} from "@/lib/knowledge/constants";
import { syncKnowledgeFile } from "@/lib/knowledge/sync";

function seedRoot(): string {
  return join(process.cwd(), ...KNOWLEDGE_SEED_DIR);
}

/** Insert missing canonical files from `seeds/founder/` and chunk + embed each. */
export async function seedKnowledgeFromRepo(userId: string): Promise<{
  created: string[];
  skipped: string[];
}> {
  const root = seedRoot();
  const created: string[] = [];
  const skipped: string[] = [];

  for (const fileName of CANONICAL_KNOWLEDGE_FILES) {
    const existing = await prisma.knowledgeFile.findUnique({
      where: { userId_fileName: { userId, fileName } },
    });
    if (existing) {
      skipped.push(fileName);
      continue;
    }

    let buf: string;
    try {
      buf = await readFile(join(root, fileName), "utf8");
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
          `Missing seed file: ${fileName} under seeds/founder/`,
          500,
        );
      }
      throw e;
    }

    await syncKnowledgeFile(userId, fileName, buf);
    created.push(fileName);
  }

  return { created, skipped };
}
