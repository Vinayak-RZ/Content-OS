import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { privatePageMetadata } from "@/lib/seo/metadata";
import { getSession } from "@/lib/session";

export const metadata: Metadata = privatePageMetadata;

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  if (!session.user.onboardingCompleted) {
    redirect("/onboarding");
  }

  return (
    <AppShell>
      <div className="flex min-w-0 flex-1 flex-col bg-background">{children}</div>
    </AppShell>
  );
}
