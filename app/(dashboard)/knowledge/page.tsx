import { AppHeader } from "@/components/app-header";
import { KnowledgeShell } from "@/components/knowledge-shell";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function KnowledgePage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;

  const files = await prisma.knowledgeFile.findMany({
    where: { userId },
    select: {
      slug: true,
      fileName: true,
      displayName: true,
      role: true,
      sortOrder: true,
      isSystem: true,
      updatedAt: true,
      fileVersion: true,
    },
    orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
  });

  const counts = await prisma.knowledgeChunk.groupBy({
    by: ["fileName"],
    where: { userId },
    _count: { _all: true },
  });
  const chunkByFile = Object.fromEntries(
    counts.map((c) => [c.fileName, c._count._all]),
  );

  const initialFiles = files.map((f) => ({
    slug: f.slug,
    fileName: f.fileName,
    displayName: f.displayName,
    role: f.role,
    sortOrder: f.sortOrder,
    isSystem: f.isSystem,
    updatedAt: f.updatedAt.toISOString(),
    fileVersion: f.fileVersion,
    chunkCount: chunkByFile[f.fileName] ?? 0,
  }));

  return (
    <>
      <AppHeader title="Knowledge" breadcrumb="App" />
      <KnowledgeShell initialFiles={initialFiles} />
    </>
  );
}
