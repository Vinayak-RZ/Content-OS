"use client";

import Link from "next/link";
import {
  Globe,
  Link2,
  Loader2,
  PenLine,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useCallback, useState } from "react";

import { RecentBlogsPanel } from "@/components/blog/recent-blogs-panel";
import { DraftGenerationOverlay } from "@/components/draft/draft-generation-overlay";
import { Badge } from "@/components/ui/badge";
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
import type { BlogSourceText } from "@/lib/blogs/types";
import { READ_TIME_OPTIONS, type ReadTimeOption } from "@/lib/blogs/read-time";
import { generateBlogStream } from "@/lib/client/generate-blog-stream";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { useAppRouter } from "@/lib/client/use-app-router";
import type { SerializedBlogSummary } from "@/lib/blogs/types";
import { cn } from "@/lib/utils";

function SourceBadge({ source }: { source: BlogSourceText["source"] }) {
  const label =
    source === "tavily" ? "Tavily" : source === "firecrawl" ? "Firecrawl" : "URL";
  return (
    <Badge variant="default" className="h-5 shrink-0 px-1.5 text-[10px] normal-case">
      {label}
    </Badge>
  );
}

export function BlogWritingSection({
  initialBlogs,
  hasTavilyKey,
  hasFirecrawlKey,
  hasAnyDraftKey,
}: {
  initialBlogs: SerializedBlogSummary[];
  hasTavilyKey: boolean;
  hasFirecrawlKey: boolean;
  hasAnyDraftKey: boolean;
}) {
  const router = useAppRouter();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [title, setTitle] = useState("");
  const [urlInputs, setUrlInputs] = useState<string[]>([""]);
  const [sourceTexts, setSourceTexts] = useState<BlogSourceText[]>([]);
  const [readTimeMinutes, setReadTimeMinutes] = useState<ReadTimeOption>(5);
  const [busy, setBusy] = useState<"idle" | "research" | "gen">("idle");
  const [msg, setMsg] = useState<string | null>(null);
  const [streamText, setStreamText] = useState("");
  const [streamStatus, setStreamStatus] = useState<string | null>(null);

  const seedUrls = urlInputs.map((u) => u.trim()).filter(Boolean);

  const refreshBlogs = useCallback(async () => {
    const result = await fetchJson<{ blogs: SerializedBlogSummary[] }>("/api/blog");
    if (result.ok) {
      setBlogs(result.data.blogs);
    }
  }, []);

  function updateUrl(index: number, value: string) {
    setUrlInputs((prev) => prev.map((u, i) => (i === index ? value : u)));
  }

  function addUrlField() {
    setUrlInputs((prev) => (prev.length >= 5 ? prev : [...prev, ""]));
  }

  function removeUrlField(index: number) {
    setUrlInputs((prev) =>
      prev.length <= 1 ? [""] : prev.filter((_, i) => i !== index),
    );
  }

  function removeSource(url: string) {
    setSourceTexts((prev) => prev.filter((s) => s.url !== url));
  }

  async function researchSources(): Promise<void> {
    if (!title.trim()) {
      setMsg("Enter a title first.");
      return;
    }
    setBusy("research");
    setMsg(null);
    try {
      const result = await fetchJson<{ sources: BlogSourceText[] }>(
        "/api/blog/research",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title.trim(),
            seedUrls,
          }),
        },
      );
      if (!result.ok) throw new Error(result.error);
      setSourceTexts(result.data.sources);
      if (result.data.sources.length === 0) {
        toast("No sources found. Add URLs manually or check API keys.", "error");
      } else {
        toast(`Found ${result.data.sources.length} source(s).`, "success");
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : "Research failed";
      setMsg(message);
      toast(message, "error");
    } finally {
      setBusy("idle");
    }
  }

  async function generate(): Promise<void> {
    if (!title.trim()) {
      setMsg("Title required.");
      return;
    }
    if (!hasAnyDraftKey) {
      setMsg("Add a draft provider key in Settings first.");
      return;
    }
    setBusy("gen");
    setMsg(null);
    setStreamText("");
    setStreamStatus(null);
    try {
      const result = await generateBlogStream({
        body: {
          title: title.trim(),
          sourceTexts,
          readTimeMinutes,
        },
        onDelta: setStreamText,
        onStatus: setStreamStatus,
      });
      toast("Blog draft ready.", "success");
      router.push(`/blog/${result.blogId}?new=1`);
      void refreshBlogs();
    } catch (e) {
      const message = e instanceof Error ? e.message : "Generate failed";
      setMsg(message);
      toast(message, "error");
    } finally {
      setBusy("idle");
      setStreamStatus(null);
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        <Card className="border-border/80 shadow-pill">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenLine className="size-5 text-brand" />
              Blog writing
            </CardTitle>
            <CardDescription>
              Research sources with{" "}
              <Link
                href="/settings"
                className="text-brand underline-offset-4 hover:underline"
              >
                Tavily
              </Link>{" "}
              and{" "}
              <Link
                href="/settings"
                className="text-brand underline-offset-4 hover:underline"
              >
                Firecrawl
              </Link>
              , set your target read time, then generate a long-form post in your
              Knowledge voice.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="blog-title">Title</Label>
              <Input
                id="blog-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What is this blog about?"
              />
            </div>

            <div className="grid gap-2">
              <div className="flex items-center justify-between gap-2">
                <Label>Source URLs (optional)</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 gap-1 px-2 text-xs"
                  disabled={urlInputs.length >= 5}
                  onClick={addUrlField}
                >
                  <Plus className="size-3.5" />
                  Add URL
                </Button>
              </div>
              <div className="flex flex-col gap-2">
                {urlInputs.map((url, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="https://…"
                      value={url}
                      onChange={(e) => updateUrl(index, e.target.value)}
                      className="flex-1"
                    />
                    {urlInputs.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="size-8 shrink-0 px-2"
                        onClick={() => removeUrlField(index)}
                        aria-label="Remove URL"
                      >
                        <X className="size-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={busy !== "idle" || !title.trim()}
                onClick={() => void researchSources()}
                className="gap-1.5"
              >
                {busy === "research" ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Search className="size-4" />
                )}
                Gather sources
              </Button>
              {!hasTavilyKey || !hasFirecrawlKey ? (
                <p className="self-center text-xs text-muted-foreground">
                  {!hasTavilyKey && !hasFirecrawlKey
                    ? "Add Tavily or Firecrawl keys for web research."
                    : !hasTavilyKey
                      ? "Tavily key unlocks web search."
                      : "Firecrawl key unlocks full page scrapes."}
                </p>
              ) : null}
            </div>

            {sourceTexts.length > 0 ? (
              <div className="grid gap-2">
                <Label>Text resources ({sourceTexts.length})</Label>
                <ul className="flex max-h-56 flex-col gap-2 overflow-y-auto rounded-lg border border-subtle bg-muted/10 p-2">
                  {sourceTexts.map((source) => (
                    <li
                      key={source.url}
                      className="flex gap-2 rounded-md border border-subtle/80 bg-card px-2.5 py-2"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start gap-2">
                          <p className="line-clamp-1 flex-1 text-sm font-medium">
                            {source.title}
                          </p>
                          <SourceBadge source={source.source} />
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                          {source.excerpt || source.url}
                        </p>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1 inline-flex items-center gap-1 text-xs text-brand hover:underline"
                        >
                          <Link2 className="size-3" />
                          Open source
                        </a>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="size-7 shrink-0 px-1.5"
                        onClick={() => removeSource(source.url)}
                        aria-label="Remove source"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="grid gap-2">
              <Label>Target read time</Label>
              <div className="flex flex-wrap gap-2">
                {READ_TIME_OPTIONS.map((minutes) => (
                  <button
                    key={minutes}
                    type="button"
                    onClick={() => setReadTimeMinutes(minutes)}
                    className={cn(
                      "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors",
                      readTimeMinutes === minutes
                        ? "border-brand bg-brand/10 text-brand"
                        : "border-subtle bg-muted/20 text-muted-foreground hover:bg-muted/40",
                    )}
                  >
                    {minutes} min
                  </button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                ~{readTimeMinutes * 200} words at average reading speed.
              </p>
            </div>

            <Button
              type="button"
              disabled={busy !== "idle" || !title.trim() || !hasAnyDraftKey}
              onClick={() => void generate()}
              className="gap-1.5"
            >
              {busy === "gen" ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Generating blog…
                </>
              ) : (
                <>
                  <Globe className="size-4" />
                  Generate blog
                </>
              )}
            </Button>

            {msg ? (
              <p className="text-sm text-muted-foreground" role="status">
                {msg}
              </p>
            ) : null}
          </CardContent>
        </Card>

        <RecentBlogsPanel blogs={blogs} />
      </div>

      {busy === "gen" ? (
        <DraftGenerationOverlay
          title="Generating blog"
          text={streamText}
          statusMessage={streamStatus}
        />
      ) : null}
    </>
  );
}
