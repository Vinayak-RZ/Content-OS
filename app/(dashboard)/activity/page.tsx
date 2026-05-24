import { AppHeader } from "@/components/app-header";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/session";

export default async function ActivityPage() {
  const session = await getSession();
  const userId = session!.user!.id;

  const logs = await prisma.cronLog.findMany({
    where: { userId },
    orderBy: { runAt: "desc" },
    take: 40,
  });

  return (
    <>
      <AppHeader title="Discovery activity" breadcrumb="System" />
      <div className="flex flex-1 flex-col gap-6 px-8 pb-16 pt-2">
        <p className="max-w-2xl text-sm text-muted-foreground">
          Cron and manual discovery runs logged here with adapter counts (including carried-over topics).
        </p>

        {logs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-12 text-center text-sm text-muted-foreground">
            No runs recorded yet.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {logs.map((log) => (
              <article
                key={log.id}
                className="rounded-2xl border border-border/70 bg-card px-5 py-4 shadow-pill"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium">
                    {log.runAt.toLocaleString()}
                  </span>
                  <span
                    className={
                      log.success
                        ? "rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-800"
                        : "rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-semibold text-destructive"
                    }
                  >
                    {log.success ? "Success" : "Failed"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Pool size {log.totalDiscovered} · {log.durationMs}ms
                </p>
                <pre className="mt-3 max-h-40 overflow-auto rounded-lg bg-muted/40 p-3 text-[11px] leading-relaxed text-muted-foreground">
                  {JSON.stringify(log.sourceCounts, null, 2)}
                </pre>
                {log.errorMessage ? (
                  <p className="mt-2 text-xs text-destructive">{log.errorMessage}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
