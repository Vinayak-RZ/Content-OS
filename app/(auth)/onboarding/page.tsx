import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { toSettingsResponse, userNeedsOnboarding } from "@/lib/user-settings";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  if (!userNeedsOnboarding(user)) {
    redirect("/dashboard");
  }

  return (
    <>
      <h1 className="mb-6 text-center text-2xl font-semibold tracking-tight">
        Set up Content OS
      </h1>
      <OnboardingWizard initial={toSettingsResponse(user)} />
    </>
  );
}
