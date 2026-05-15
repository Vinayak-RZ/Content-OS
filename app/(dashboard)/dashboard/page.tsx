import Link from "next/link";
import { AppHeader } from "@/components/app-header";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { DiscoveryRunButton } from "@/components/discovery-run-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/session";

export default async function DashboardPage() {
  const session = await getSession();

  return (
    <>
      <AppHeader title="Dashboard" breadcrumb="App" />
      <div className="flex flex-1 flex-col gap-6 px-8 pb-16">
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>
              Hello{session?.user?.name ? `, ${session.user.name.split(" ")[0]}` : ""}
            </CardTitle>
            <CardDescription>
              Topic cards land in Phase 5. Discovery runs on the schedule cron (users with digest on)
              or you can fetch trends now below. Manage founder context under Knowledge.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <DiscoveryRunButton />
            <div className="flex flex-wrap gap-3 border-t border-border/60 pt-4">
              <Link href="/knowledge">
                <Button>Knowledge</Button>
              </Link>
              <Link href="/settings">
                <Button variant="outline">Settings</Button>
              </Link>
              <SignOutButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
