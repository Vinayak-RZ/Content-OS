import { notFound } from "next/navigation";

import { AppHeader } from "@/components/app-header";
import { LinkedInTrendsPanel } from "@/components/improve/linkedin-trends-panel";
import { PerformanceAnalysisPanel } from "@/components/improve/performance-analysis";
import { getAppAccess } from "@/lib/app-access";
import { getImprovementRun } from "@/lib/improvement/run";
import type { ImprovementRunSummary } from "@/lib/improvement/types";

type PageProps = { params: Promise<{ id: string }> };

export default async function ImproveRunDetailPage({ params }: PageProps) {
  const access = await getAppAccess();
  if (!access || access.mode !== "user") {
    return null;
  }

  const { id } = await params;
  const run = await getImprovementRun(access.userId, id);
  if (!run) {
    notFound();
  }

  const summary = run.summary as ImprovementRunSummary | null;

  return (
    <>
      <AppHeader
        title="Improvement run"
        breadcrumb="Improve"
        description={`${run.status} · ${new Date(run.startedAt).toLocaleString()}`}
      />
      <div className="page-x flex flex-1 flex-col gap-8 pb-8 pt-4 sm:pt-6">
        {run.error ? (
          <p className="text-sm text-red-600">{run.error}</p>
        ) : null}

        {summary?.analysis ? (
          <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
            <h2 className="font-heading text-lg font-semibold">
              Performance analysis snapshot
            </h2>
            <div className="mt-6">
              <PerformanceAnalysisPanel analysis={summary.analysis} />
            </div>
          </section>
        ) : null}

        {summary?.linkedinResearch ? (
          <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
            <h2 className="font-heading text-lg font-semibold">
              LinkedIn research snapshot
            </h2>
            <div className="mt-6">
              <LinkedInTrendsPanel research={summary.linkedinResearch} />
            </div>
          </section>
        ) : null}

        {run.proposals.length > 0 ? (
          <section className="rounded-xl border border-subtle bg-card p-6 shadow-ambient sm:p-8">
            <h2 className="font-heading text-lg font-semibold">Proposals</h2>
            <ul className="mt-4 space-y-2 text-sm">
              {run.proposals.map((p) => (
                <li key={p.id}>
                  {p.title} —{" "}
                  <span className="capitalize">{p.status}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
