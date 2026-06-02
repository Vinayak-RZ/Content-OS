import { AppHeader } from "@/components/app-header";
import { FeatureRequestPanel } from "@/components/feature-request-panel";
import { SettingsForm } from "@/components/settings-form";
import {
  GuestPreviewPage,
  GuestSignInOverlay,
} from "@/components/guest/guest-sign-in-overlay";
import { getAppAccess } from "@/lib/app-access";
import { GUEST_DEMO_SETTINGS } from "@/lib/guest/demo-data";
import { prisma } from "@/lib/db";
import { toSettingsResponse } from "@/lib/user-settings";

export default async function SettingsPage() {
  const access = await getAppAccess();
  const isGuest = access?.mode === "guest";

  if (isGuest) {
    return (
      <GuestPreviewPage
        header={
          <AppHeader
            title="Settings"
            breadcrumb="Workspace"
            description="API keys, draft provider, and discovery preferences."
          />
        }
        overlay={
          <GuestSignInOverlay
            feature="Settings"
            description="Preview API keys, persona, and draft provider options. Sign in to save encrypted credentials to your workspace."
          >
            <div className="page-x space-y-6 pb-16 pt-4 sm:pt-6">
              <SettingsForm initial={GUEST_DEMO_SETTINGS} />
              <FeatureRequestPanel variant="settings" />
            </div>
          </GuestSignInOverlay>
        }
      />
    );
  }

  if (!access || access.mode !== "user") {
    return null;
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: access.userId },
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
