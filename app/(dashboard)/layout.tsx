import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";
import { userNeedsOnboarding } from "@/lib/user-settings";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  if (userNeedsOnboarding(user)) {
    redirect("/onboarding");
  }

  return (
    <AppShell>
      <div className="flex min-w-0 flex-1 flex-col bg-background">{children}</div>
    </AppShell>
  );
}
