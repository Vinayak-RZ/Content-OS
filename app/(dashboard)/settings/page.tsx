import { AppHeader } from "@/components/app-header";
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
      <div className="px-8 pb-16">
        <SettingsForm initial={toSettingsResponse(user)} />
      </div>
    </>
  );
}
