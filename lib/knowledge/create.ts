import type { KnowledgeFile } from "@prisma/client";

import { ApiError } from "@/lib/api-error";
import { prisma } from "@/lib/db";
import {
  MAX_KNOWLEDGE_FILES_PER_USER,
  type KnowledgeRole,
} from "@/lib/knowledge/constants";
import { syncKnowledgeFile } from "@/lib/knowledge/sync";
import {
  getSystemMetaBySlug,
  parseKnowledgeSlug,
  slugToFileName,
} from "@/lib/knowledge/slug";

export type CreateKnowledgeInput = {
  slug: string;
  displayName: string;
  role: KnowledgeRole;
  content?: string;
  isSystem?: boolean;
  sortOrder?: number;
};

export async function countKnowledgeFiles(userId: string): Promise<number> {
  return prisma.knowledgeFile.count({ where: { userId } });
}

export async function createKnowledgeDocument(
  userId: string,
  input: CreateKnowledgeInput,
): Promise<KnowledgeFile> {
  const slug = parseKnowledgeSlug(input.slug);
  if (!slug) {
    throw new ApiError("VALIDATION_ERROR", "Invalid document slug", 400);
  }

  const systemMeta = getSystemMetaBySlug(slug);
  if (systemMeta && !input.isSystem) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "This slug is reserved for system documents",
      400,
    );
  }

  const fileName = slugToFileName(slug);
  const existingSlug = await prisma.knowledgeFile.findUnique({
    where: { userId_slug: { userId, slug } },
  });
  const existingFile = await prisma.knowledgeFile.findUnique({
    where: { userId_fileName: { userId, fileName } },
  });
  if (existingSlug || existingFile) {
    throw new ApiError("CONFLICT", "A document with this slug already exists", 409);
  }

  const count = await countKnowledgeFiles(userId);
  if (count >= MAX_KNOWLEDGE_FILES_PER_USER) {
    throw new ApiError(
      "VALIDATION_ERROR",
      `Maximum ${MAX_KNOWLEDGE_FILES_PER_USER} knowledge documents`,
      400,
    );
  }

  const content = input.content ?? "";
  const maxSort = await prisma.knowledgeFile.aggregate({
    where: { userId },
    _max: { sortOrder: true },
  });
  const sortOrder =
    input.sortOrder ??
    (typeof maxSort._max.sortOrder === "number" ? maxSort._max.sortOrder + 1 : 10);

  await prisma.knowledgeFile.create({
    data: {
      userId,
      slug,
      fileName,
      displayName: input.displayName.trim().slice(0, 120),
      role: input.role,
      sortOrder,
      isSystem: input.isSystem ?? false,
      content,
      fileVersion: 0,
    },
  });

  return syncKnowledgeFile(userId, slug, content);
}
