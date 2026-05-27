import type { Metadata } from "next";

import { LandingPage } from "@/components/landing/landing-page";
import { JsonLd } from "@/components/seo/json-ld";
import { buildHomeJsonLd } from "@/lib/seo/json-ld-schemas";
import { homePageMetadata } from "@/lib/seo/metadata";
import { getSession } from "@/lib/session";

export const metadata: Metadata = homePageMetadata;

export default async function HomePage() {
  const session = await getSession();
  const isAuthenticated = Boolean(session?.user?.id);
  const dashboardHref = session?.user?.onboardingCompleted
    ? "/dashboard"
    : "/onboarding";

  return (
    <>
      <JsonLd data={buildHomeJsonLd()} />
      <LandingPage
        isAuthenticated={isAuthenticated}
        dashboardHref={dashboardHref}
      />
    </>
  );
}
