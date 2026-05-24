import type { KnowledgeFile, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { splitKnowledgeIntoChunks } from "@/lib/knowledge/chunk";
import { embedTexts } from "@/lib/knowledge/embed";
import { parseKnowledgeSlug, slugToFileName } from "@/lib/knowledge/slug";

async function resolveKnowledgeFile(
  userId: string,
  slug: string,
): Promise<KnowledgeFile | null> {
  return prisma.knowledgeFile.findUnique({
    where: { userId_slug: { userId, slug } },
  });
}

/**
 * Upsert markdown content when `content` is provided; otherwise re-chunk/embed from DB row.
 */
export async function syncKnowledgeFile(
  userId: string,
  slugOrRaw: string,
  content?: string,
): Promise<KnowledgeFile> {
  const slug = parseKnowledgeSlug(slugOrRaw) ?? parseKnowledgeSlug(slugOrRaw.replace(/\.md$/i, ""));
  if (!slug) {
    throw new Error("Invalid knowledge document slug");
  }

  const existing = await resolveKnowledgeFile(userId, slug);
  const fileName = existing?.fileName ?? slugToFileName(slug);

  if (!existing && content === undefined) {
    throw new Error(`Knowledge file not found: ${slug}`);
  }

  let body: string;
  let fileVersion: number;

  if (content !== undefined) {
    body = content;
    fileVersion =
      typeof existing?.fileVersion === "number" ? existing.fileVersion + 1 : 1;
  } else {
    body = existing!.content;
    fileVersion = existing!.fileVersion;
  }

  const chunkTexts = splitKnowledgeIntoChunks(body);
  const embeddings =
    chunkTexts.length > 0 ? await embedTexts(chunkTexts) : [];

  return prisma.$transaction(async (tx) => {
    if (content !== undefined) {
      if (existing) {
        await tx.knowledgeFile.update({
          where: { userId_slug: { userId, slug } },
          data: { content: body, fileVersion },
        });
      } else {
        throw new Error(
          `Cannot sync unknown document ${slug}; create via createKnowledgeDocument`,
        );
      }
    }

    await tx.knowledgeChunk.deleteMany({
      where: { userId, fileName },
    });

    await insertKnowledgeChunks(tx, {
      userId,
      fileName,
      chunkTexts,
      embeddings,
      fileVersion,
    });

    return tx.knowledgeFile.findUniqueOrThrow({
      where: { userId_slug: { userId, slug } },
    });
  });
}

async function insertKnowledgeChunks(
  tx: Prisma.TransactionClient,
  params: {
    userId: string;
    fileName: string;
    chunkTexts: string[];
    embeddings: number[][];
    fileVersion: number;
  },
): Promise<void> {
  const { userId, fileName, chunkTexts, embeddings, fileVersion } = params;
  if (chunkTexts.length !== embeddings.length) {
    throw new Error("Chunk / embedding mismatch");
  }
  for (let i = 0; i < chunkTexts.length; i += 1) {
    const id = randomUUID();
    const vec = embeddings[i];
    if (!vec || vec.length !== 1536) {
      throw new Error(
        `Embedding dimension must be 1536, got ${vec?.length ?? 0}`,
      );
    }
    const vectorLiteral = `[${vec.join(",")}]`;
    await tx.$executeRawUnsafe(
      `INSERT INTO "KnowledgeChunk" ("id", "userId", "fileName", "chunkText", "embedding", "chunkIndex", "fileVersion", "updatedAt")
       VALUES ($1, $2, $3, $4, $5::vector, $6, $7, NOW())`,
      id,
      userId,
      fileName,
      chunkTexts[i],
      vectorLiteral,
      i,
      fileVersion,
    );
  }
}
