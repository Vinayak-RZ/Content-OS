import { AppHeader } from "@/components/app-header";
import { KnowledgeShell } from "@/components/knowledge-shell";
import { ProfilePromptPanel } from "@/components/knowledge/profile-prompt-panel";
import {
  GuestPreviewPage,
  GuestSignInOverlay,
} from "@/components/guest/guest-sign-in-overlay";
import { getAppAccess } from "@/lib/app-access";
import { GUEST_DEMO_KNOWLEDGE_FILES } from "@/lib/guest/demo-data";
import { prisma } from "@/lib/db";
import { isPersonaType } from "@/lib/personas/types";

export default async function KnowledgePage({
  searchParams,
}: {
  searchParams: Promise<{ studio?: string }>;
}) {
  const access = await getAppAccess();
  const sp = await searchParams;
  const studioMode = sp.studio === "1";
  const isGuest = access?.mode === "guest";

  if (isGuest) {
    return (
      <GuestPreviewPage
        header={
          <AppHeader
            title="Knowledge"
            breadcrumb="Workspace"
            description="Context files that ground discovery and draft generation in your voice."
          />
        }
        overlay={
          <GuestSignInOverlay
            feature="Knowledge"
            description="Preview how documents, roles, and starter templates are organized. Sign in to upload files and run real ranking."
          >
            <div className="page-x flex flex-col gap-4 pb-8 pt-4 sm:gap-6 sm:pt-6">
              <ProfilePromptPanel personaType="founder" personaCustom={null} />
              <KnowledgeShell
                initialFiles={GUEST_DEMO_KNOWLEDGE_FILES}
                previewMode
              />
            </div>
          </GuestSignInOverlay>
        }
      />
    );
  }

  if (!access || access.mode !== "user") {
    return null;
  }
  const userId = access.userId;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { personaType: true, personaCustom: true },
  });

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
      <AppHeader
        title="Knowledge"
        breadcrumb="Workspace"
        description="Context files that ground discovery and draft generation in your voice."
      />
      <div className="page-x flex flex-1 flex-col gap-4 pb-8 pt-4 sm:gap-6 sm:pt-6">
        <ProfilePromptPanel
          studioMode={studioMode}
          personaType={
            user.personaType && isPersonaType(user.personaType)
              ? user.personaType
              : null
          }
          personaCustom={user.personaCustom}
        />
        <KnowledgeShell initialFiles={initialFiles} />
      </div>
    </>
  );
}
