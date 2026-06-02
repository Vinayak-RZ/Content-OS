import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { getAppAccess } from "@/lib/app-access";
import { clearGuestSessionCookie } from "@/lib/guest/cookie";
import { privatePageMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = privatePageMetadata;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const access = await getAppAccess();
  if (!access) {
    redirect("/login");
  }

  if (access.mode === "user") {
    await clearGuestSessionCookie();
    if (!access.onboardingCompleted) {
      redirect("/onboarding");
    }
    return (
      <AppShell isGuest={false}>
        <div className="flex min-h-0 flex-1 flex-col">{children}</div>
      </AppShell>
    );
  }

  return (
    <AppShell isGuest>
      <div className="flex min-h-0 flex-1 flex-col">{children}</div>
    </AppShell>
  );
}
