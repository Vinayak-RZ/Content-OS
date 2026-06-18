import type { KnowledgeFile } from "@prisma/client";

import { prisma } from "@/lib/db";
import { AGENT_INSIGHT_FILES } from "@/lib/knowledge/constants";
import { createKnowledgeDocument } from "@/lib/knowledge/create";
import { syncKnowledgeFile } from "@/lib/knowledge/sync";

type AgentInsightMeta = (typeof AGENT_INSIGHT_FILES)[number];

function getMetaBySlug(slug: string): AgentInsightMeta | undefined {
  return AGENT_INSIGHT_FILES.find((f) => f.slug === slug);
}

/**
 * Upsert an agent-managed insight document and re-embed chunks.
 */
export async function upsertAgentInsightFile(
  userId: string,
  slug: string,
  content: string,
  runId: string,
): Promise<KnowledgeFile> {
  const meta = getMetaBySlug(slug);
  if (!meta) {
    throw new Error(`Unknown agent insight slug: ${slug}`);
  }

  const existing = await prisma.knowledgeFile.findUnique({
    where: { userId_slug: { userId, slug } },
  });

  if (!existing) {
    await createKnowledgeDocument(userId, {
      slug,
      displayName: meta.displayName,
      role: "insights",
      content,
      isSystem: false,
      sortOrder: meta.sortOrder,
    });
    await prisma.knowledgeFile.update({
      where: { userId_slug: { userId, slug } },
      data: { isAgentManaged: true, lastImprovementRunId: runId },
    });
    return syncKnowledgeFile(userId, slug, content);
  }

  await prisma.knowledgeFile.update({
    where: { userId_slug: { userId, slug } },
    data: { isAgentManaged: true, lastImprovementRunId: runId },
  });

  return syncKnowledgeFile(userId, slug, content);
}

export async function listAgentInsightFiles(userId: string) {
  return prisma.knowledgeFile.findMany({
    where: { userId, isAgentManaged: true, role: "insights" },
    orderBy: [{ sortOrder: "asc" }, { fileName: "asc" }],
    select: {
      slug: true,
      fileName: true,
      displayName: true,
      content: true,
      fileVersion: true,
      updatedAt: true,
      lastImprovementRunId: true,
    },
  });
}
