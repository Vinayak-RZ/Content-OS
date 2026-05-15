import type { KnowledgeFile, Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/db";
import { splitKnowledgeIntoChunks } from "@/lib/knowledge/chunk";
import { embedTexts } from "@/lib/knowledge/embed";
import { parseKnowledgeFileName } from "@/lib/knowledge/file-name";

/**
 * Upsert markdown content when `content` is provided; otherwise re-chunk/embed from DB row.
 */
export async function syncKnowledgeFile(
  userId: string,
  fileName: string,
  content?: string,
): Promise<KnowledgeFile> {
  const safeName = parseKnowledgeFileName(fileName);
  if (!safeName) {
    throw new Error("Invalid knowledge file name");
  }

  const existing = await prisma.knowledgeFile.findUnique({
    where: { userId_fileName: { userId, fileName: safeName } },
  });

  let body: string;
  let fileVersion: number;

  if (content !== undefined) {
    body = content;
    fileVersion =
      typeof existing?.fileVersion === "number" ? existing.fileVersion + 1 : 1;
  } else {
    if (!existing) {
      throw new Error(`Knowledge file not found: ${safeName}`);
    }
    body = existing.content;
    fileVersion = existing.fileVersion;
  }

  const chunkTexts = splitKnowledgeIntoChunks(body);
  const embeddings =
    chunkTexts.length > 0 ? await embedTexts(chunkTexts) : [];

  return prisma.$transaction(async (tx) => {
    if (content !== undefined) {
      await tx.knowledgeFile.upsert({
        where: { userId_fileName: { userId, fileName: safeName } },
        create: {
          userId,
          fileName: safeName,
          content: body,
          fileVersion,
        },
        update: { content: body, fileVersion },
      });
    }

    await tx.knowledgeChunk.deleteMany({
      where: { userId, fileName: safeName },
    });

    await insertKnowledgeChunks(tx, {
      userId,
      fileName: safeName,
      chunkTexts,
      embeddings,
      fileVersion,
    });

    return tx.knowledgeFile.findUniqueOrThrow({
      where: { userId_fileName: { userId, fileName: safeName } },
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
