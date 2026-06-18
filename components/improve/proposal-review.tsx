"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/lib/client/toast";

type Proposal = {
  id: string;
  type: string;
  target: string;
  title: string;
  rationale: string;
  currentValue: unknown;
  proposedValue: unknown;
  status: string;
  createdAt: string;
};

function WeightBars({
  label,
  current,
  proposed,
}: {
  label: string;
  current: Record<string, number>;
  proposed: Record<string, number>;
}) {
  const keys = Array.from(
    new Set([...Object.keys(current), ...Object.keys(proposed)]),
  );

  return (
    <div className="mt-3 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {keys.map((key) => (
        <div key={key}>
          <div className="mb-1 flex justify-between text-xs capitalize">
            <span>{key}</span>
            <span className="tabular-nums text-muted-foreground">
              {(current[key] ?? 0).toFixed(2)} → {(proposed[key] ?? 0).toFixed(2)}
            </span>
          </div>
          <div className="flex h-2 gap-1">
            <div
              className="rounded-l bg-muted-foreground/30"
              style={{ width: `${(current[key] ?? 0) * 100}%` }}
            />
            <div
              className="rounded-r bg-brand"
              style={{ width: `${(proposed[key] ?? 0) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function StyleDiff({
  current,
  proposed,
}: {
  current: string;
  proposed: string;
}) {
  return (
    <div className="mt-3 grid gap-3 md:grid-cols-2">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
          Current
        </p>
        <pre className="max-h-48 overflow-auto rounded-lg border border-subtle bg-muted/10 p-3 text-xs whitespace-pre-wrap">
          {current.slice(0, 2000)}
          {current.length > 2000 ? "…" : ""}
        </pre>
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase text-brand">
          Proposed
        </p>
        <pre className="max-h-48 overflow-auto rounded-lg border border-brand/30 bg-brand/5 p-3 text-xs whitespace-pre-wrap">
          {proposed.slice(0, 2000)}
          {proposed.length > 2000 ? "…" : ""}
        </pre>
      </div>
    </div>
  );
}

export function ProposalReview({ onChanged }: { onChanged?: () => void }) {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [past, setPast] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pendingRes, allRes] = await Promise.all([
        fetch("/api/improve/proposals?status=pending"),
        fetch("/api/improve/proposals"),
      ]);
      const pendingData = (await pendingRes.json()) as { proposals?: Proposal[] };
      const allData = (await allRes.json()) as { proposals?: Proposal[] };
      setProposals(pendingData.proposals ?? []);
      setPast(
        (allData.proposals ?? []).filter((p) => p.status !== "pending"),
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function decide(id: string, action: "approve" | "reject") {
    setActing(id);
    try {
      const res = await fetch(`/api/improve/proposals/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed");
      toast(
        action === "approve" ? "Proposal applied" : "Proposal rejected",
        "success",
      );
      await load();
      await onChanged?.();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Action failed", "error");
    } finally {
      setActing(null);
    }
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading proposals…</p>;
  }

  if (proposals.length === 0 && past.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No proposals yet. Run an improvement cycle with enough attributed posts.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {proposals.map((p) => {
        const currentVal = p.currentValue as Record<string, unknown>;
        const proposedVal = p.proposedValue as Record<string, unknown>;

        return (
          <article
            key={p.id}
            className="rounded-xl border border-subtle bg-card p-4 shadow-ambient sm:p-6"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h4 className="font-heading font-semibold">{p.title}</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {p.rationale}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  disabled={acting === p.id}
                  onClick={() => void decide(p.id, "reject")}
                >
                  <X className="mr-1 size-3.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  disabled={acting === p.id}
                  onClick={() => void decide(p.id, "approve")}
                >
                  <Check className="mr-1 size-3.5" />
                  Approve
                </Button>
              </div>
            </div>

            {p.type === "style_edit" ? (
              <StyleDiff
                current={(currentVal.content as string) ?? ""}
                proposed={(proposedVal.content as string) ?? ""}
              />
            ) : null}

            {p.type === "ranking_weights" ? (
              <>
                <WeightBars
                  label="Signals pipeline"
                  current={(currentVal.signals as Record<string, number>) ?? {}}
                  proposed={(proposedVal.signals as Record<string, number>) ?? {}}
                />
                <WeightBars
                  label="Studio pipeline"
                  current={(currentVal.studio as Record<string, number>) ?? {}}
                  proposed={(proposedVal.studio as Record<string, number>) ?? {}}
                />
              </>
            ) : null}
          </article>
        );
      })}

      {past.length > 0 ? (
        <details className="rounded-lg border border-subtle p-4">
          <summary className="cursor-pointer text-sm font-semibold">
            Past decisions ({past.length})
          </summary>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {past.map((p) => (
              <li key={p.id}>
                {p.title} —{" "}
                <span className="capitalize">{p.status}</span> ·{" "}
                {new Date(p.createdAt).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
