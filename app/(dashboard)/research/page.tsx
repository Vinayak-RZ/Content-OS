import Link from "next/link";

import { AppHeader } from "@/components/app-header";
import { ResearchHistory } from "@/components/research/research-history";
import { getAppAccess } from "@/lib/app-access";
import { fetchResearchHistory } from "@/lib/research/list-runs";

export default async function ResearchPage() {
  const access = await getAppAccess();

  if (!access || access.mode !== "user") {
    return null;
  }

  const days = await fetchResearchHistory(access.userId);

  return (
    <>
      <AppHeader
        title="Research"
        breadcrumb="History"
        description="Every discovery run, grouped by day — with the topics found in each run."
      />
      <div className="page-x flex flex-1 flex-col gap-6 pb-16 pt-4 sm:pt-6">
        {days.length === 0 ? (
          <ResearchHistory days={[]} />
        ) : (
          <ResearchHistory days={days} />
        )}
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/dashboard" className="text-brand hover:underline">
            Run new discovery
          </Link>
          {" · "}
          Runs before this feature may not appear here.
        </p>
      </div>
    </>
  );
}
