import { LandingPage } from "@/components/landing/landing-page";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();
  const isAuthenticated = Boolean(session?.user?.id);
  const dashboardHref = session?.user?.onboardingCompleted
    ? "/dashboard"
    : "/onboarding";

  return (
    <LandingPage
      isAuthenticated={isAuthenticated}
      dashboardHref={dashboardHref}
    />
  );
}
