import { AppHeader } from "@/components/app-header";
import { FeatureRequestPanel } from "@/components/feature-request-panel";
import { SettingsForm } from "@/components/settings-form";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toSettingsResponse } from "@/lib/user-settings";
import { redirect } from "next/navigation";

export default async function SettingsPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  return (
    <>
      <AppHeader
        title="Settings"
        breadcrumb="Workspace"
        description="API keys, draft provider, and discovery preferences."
      />
      <div className="page-x space-y-6 pb-16 pt-4 sm:pt-6">
        <SettingsForm initial={toSettingsResponse(user)} />
        <FeatureRequestPanel variant="settings" />
      </div>
    </>
  );
}
