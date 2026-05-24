"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ChevronDown, ChevronUp, Link2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";

import { DiscoveryRunButton } from "@/components/discovery-run-button";
import { TopicCard } from "@/components/dashboard/topic-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SerializedDashboardTrend } from "@/lib/trends/list";

export function TopicsDashboard({
  initialTrends,
  lastDiscovery,
}: {
  initialTrends: SerializedDashboardTrend[];
  lastDiscovery: {
    runAt: string;
    success: boolean;
    totalDiscovered: number;
  } | null;
}) {
  const router = useRouter();
  const gridRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);

  const refresh = useCallback(() => {
    router.refresh();
  }, [router]);

  useGSAP(
    () => {
      const nodes = gridRef.current?.querySelectorAll(".topic-card-stagger");
      if (!nodes?.length) return;
      gsap.from(nodes, {
        opacity: 0,
        y: 14,
        duration: 0.42,
        stagger: 0.06,
        ease: "power2.out",
      });
    },
    {
      scope: gridRef,
      dependencies: [initialTrends.map((t) => t.id).join(","), expanded],
    },
  );

  const top = initialTrends.slice(0, 3);
  const rest = initialTrends.slice(3, 10);
  const visibleRest = expanded ? rest : [];

  const discoveryHint = lastDiscovery
    ? `Last discovery ${new Date(lastDiscovery.runAt).toLocaleString()} · ${lastDiscovery.success ? "ok" : "failed"} · ${lastDiscovery.totalDiscovered} topics in pool`
    : "Run discovery to populate your topic board.";

  return (
    <div className="flex flex-col gap-10 pb-20">
      <section className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-card/40 px-6 py-6 shadow-pill">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold tracking-tight">
              Today&apos;s signals
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">{discoveryHint}</p>
          </div>
          <DiscoveryRunButton onCompleted={refresh} compact />
        </div>
      </section>

      {initialTrends.length === 0 ? (
        <Card className="border-dashed border-border/80 bg-muted/20 shadow-none">
          <CardHeader>
            <CardTitle>No topics yet</CardTitle>
            <CardDescription>
              Run discovery or paste a custom URL below. Seed Knowledge files first so ranking + drafts sound like you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DiscoveryRunButton onCompleted={refresh} />
          </CardContent>
        </Card>
      ) : (
        <div ref={gridRef} className="flex flex-col gap-10">
          <section>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Top picks
            </h3>
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {top.map((t) => (
                <TopicCard key={t.id} trend={t} />
              ))}
            </div>
          </section>

          {rest.length > 0 ? (
            <section className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  More ideas ({rest.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setExpanded(!expanded)}
                  className="gap-1"
                >
                  {expanded ? (
                    <>
                      <ChevronUp className="size-4" /> Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="size-4" /> Expand 4–10
                    </>
                  )}
                </Button>
              </div>
              {expanded ? (
                <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {visibleRest.map((t) => (
                    <TopicCard key={t.id} trend={t} />
                  ))}
                </div>
              ) : null}
            </section>
          ) : null}
        </div>
      )}

      <CustomTopicComposer onDraftCreated={(id) => router.push(`/draft/${id}`)} />
    </div>
  );
}

function CustomTopicComposer({
  onDraftCreated,
}: {
  onDraftCreated: (id: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState<"idle" | "scrape" | "gen">("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function scrapeUrl(): Promise<void> {
    setBusy("scrape");
    setMsg(null);
    try {
      const res = await fetch("/api/scrape-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err =
          typeof json === "object" &&
          json &&
          "error" in json &&
          typeof (json as { error?: string }).error === "string"
            ? (json as { error: string }).error
            : "Fetch failed";
        throw new Error(err);
      }
      const body = json as {
        titleGuess?: string | null;
        markdownPreview?: string;
      };
      if (body.titleGuess && !title.trim()) setTitle(body.titleGuess);
      if (body.markdownPreview)
        setSummary(body.markdownPreview.slice(0, 4000));
      setMsg("Pulled page content.");
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Scrape failed");
    } finally {
      setBusy("idle");
    }
  }

  async function generate(): Promise<void> {
    if (!title.trim()) {
      setMsg("Title required.");
      return;
    }
    setBusy("gen");
    setMsg(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customTopic: {
            title: title.trim(),
            summary: summary.trim() || undefined,
            url: url.trim() ? url.trim() : undefined,
          },
        }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err =
          typeof json === "object" &&
          json &&
          "error" in json &&
          typeof (json as { error?: string }).error === "string"
            ? (json as { error: string }).error
            : "Generate failed";
        throw new Error(err);
      }
      const id =
        typeof json === "object" &&
        json &&
        "draftId" in json &&
        typeof (json as { draftId?: string }).draftId === "string"
          ? (json as { draftId: string }).draftId
          : null;
      if (!id) throw new Error("Missing draft id");
      onDraftCreated(id);
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Generate failed");
    } finally {
      setBusy("idle");
    }
  }

  return (
    <Card className="border-border/80 shadow-pill">
      <CardHeader>
        <CardTitle className="text-lg">Custom topic</CardTitle>
        <CardDescription>
          Paste a URL (Firecrawl key required) or write your own angle — generates a draft with your Knowledge context.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="cu-url">Source URL (optional)</Label>
          <div className="flex flex-wrap gap-2">
            <Input
              id="cu-url"
              placeholder="https://…"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="max-w-xl flex-1"
            />
            <Button
              type="button"
              variant="outline"
              disabled={busy !== "idle" || !url.trim()}
              onClick={() => void scrapeUrl()}
              className="gap-1"
            >
              {busy === "scrape" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Link2 className="size-4" />
              )}
              Fetch page
            </Button>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cu-title">Title</Label>
          <Input
            id="cu-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What are you reacting to?"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="cu-sum">Summary / notes</Label>
          <Textarea
            id="cu-sum"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Key facts, your take, bullets…"
            className="min-h-[160px]"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            disabled={busy !== "idle" || !title.trim()}
            onClick={() => void generate()}
          >
            {busy === "gen" ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Generating…
              </>
            ) : (
              "Generate draft"
            )}
          </Button>
        </div>
        {msg ? (
          <p className="text-sm text-muted-foreground" role="status">
            {msg}
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
