"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";

type RunRow = {
  id: string;
  status: string;
  step: string | null;
  startedAt: string;
  completedAt: string | null;
  summary: {
    stats?: { postsAnalyzed?: number };
    insightFilesUpdated?: unknown[];
    proposalsCreated?: unknown[];
  } | null;
  error: string | null;
};

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    completed: "bg-green-100 text-green-800",
    failed: "bg-red-100 text-red-800",
    running: "bg-blue-100 text-blue-800",
  };
  return (
    <span
      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${colors[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

export function RunHistory() {
  const [runs, setRuns] = useState<RunRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/improve/runs");
      const data = (await res.json()) as { runs?: RunRow[] };
      setRuns(data.runs ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading run history…</p>;
  }

  if (runs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No improvement runs yet.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-subtle">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-subtle bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-4 py-3 font-semibold">Date</th>
            <th className="px-3 py-3 font-semibold">Status</th>
            <th className="px-3 py-3 font-semibold">Posts</th>
            <th className="px-3 py-3 font-semibold">Files</th>
            <th className="px-3 py-3 font-semibold">Proposals</th>
            <th className="px-4 py-3 font-semibold" />
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle">
          {runs.map((run) => (
            <tr key={run.id} className="hover:bg-muted/10">
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(run.startedAt).toLocaleString()}
              </td>
              <td className="px-3 py-3">{statusBadge(run.status)}</td>
              <td className="px-3 py-3 tabular-nums">
                {run.summary?.stats?.postsAnalyzed ?? "—"}
              </td>
              <td className="px-3 py-3 tabular-nums">
                {run.summary?.insightFilesUpdated?.length ?? "—"}
              </td>
              <td className="px-3 py-3 tabular-nums">
                {run.summary?.proposalsCreated?.length ?? "—"}
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={`/improve/runs/${run.id}`}
                  className="text-xs font-semibold text-brand hover:underline"
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function useRunHistoryRefresh() {
  const [, setTick] = useState(0);
  return useCallback(() => setTick((t) => t + 1), []);
}
