import type { KnowledgeRole } from "@/lib/knowledge/constants";
import { prisma } from "@/lib/db";

export type KnowledgeRoleMap = {
  roleByFileName: Map<string, KnowledgeRole>;
  styleFileNames: string[];
};

/** Load per-user fileName → role for retrieval and ranking. */
export async function getKnowledgeRoleMap(
  userId: string,
): Promise<KnowledgeRoleMap> {
  const files = await prisma.knowledgeFile.findMany({
    where: { userId },
    select: { fileName: true, role: true },
    orderBy: [{ sortOrder: "asc" }, { fileName: "asc" }],
  });

  const roleByFileName = new Map<string, KnowledgeRole>();
  const styleFileNames: string[] = [];

  for (const f of files) {
    const role = f.role as KnowledgeRole;
    roleByFileName.set(f.fileName, role);
    if (role === "style") {
      styleFileNames.push(f.fileName);
    }
  }

  return { roleByFileName, styleFileNames };
}
