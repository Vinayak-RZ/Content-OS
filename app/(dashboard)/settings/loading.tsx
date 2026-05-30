import { AppHeader } from "@/components/app-header";
import { SettingsPageSkeleton } from "@/components/loading/settings-page-skeleton";

export default function SettingsLoading() {
  return (
    <>
      <AppHeader
        title="Settings"
        breadcrumb="Workspace"
        description="API keys, draft provider, and discovery preferences."
      />
      <SettingsPageSkeleton />
    </>
  );
}
