"use client";

import Link from "next/link";
import { ArrowLeft, Clock, Loader2, Trash2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { DraftStatusBadge } from "@/components/ui/draft-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { countWords, estimateReadTimeMinutes } from "@/lib/blogs/read-time";
import type { SerializedBlogPost } from "@/lib/blogs/types";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { useAppRouter } from "@/lib/client/use-app-router";
import { cn } from "@/lib/utils";

export function BlogWorkspace({
  blogId,
  initialBlog,
  showNewBanner = false,
}: {
  blogId: string;
  initialBlog: SerializedBlogPost;
  showNewBanner?: boolean;
}) {
  const router = useAppRouter();
  const [blog, setBlog] = useState(initialBlog);
  const [content, setContent] = useState(initialBlog.currentContent);
  const [busy, setBusy] = useState<"idle" | "save" | "publish" | "delete">("idle");
  const [saveState, setSaveState] = useState<"saved" | "saving" | "error">("saved");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const wordCount = countWords(content);
  const estimatedRead = estimateReadTimeMinutes(wordCount);
  const isDirty = content !== blog.currentContent;

  const saveBody = useCallback(async () => {
    if (!isDirty) return;
    setBusy("save");
    setSaveState("saving");
    try {
      const result = await fetchJson<{ blog: SerializedBlogPost }>(
        `/api/blog/${blogId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ currentContent: content }),
        },
      );
      if (!result.ok) throw new Error(result.error);
      setBlog(result.data.blog);
      setSaveState("saved");
    } catch (e) {
      setSaveState("error");
      toast(e instanceof Error ? e.message : "Save failed", "error");
    } finally {
      setBusy("idle");
    }
  }, [blogId, content, isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveBody();
    }, 2000);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [content, isDirty, saveBody]);

  async function publish(): Promise<void> {
    setBusy("publish");
    try {
      const result = await fetchJson<{ blog: SerializedBlogPost }>(
        `/api/blog/${blogId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            currentContent: content,
            status: "published",
          }),
        },
      );
      if (!result.ok) throw new Error(result.error);
      setBlog(result.data.blog);
      setContent(result.data.blog.currentContent);
      toast("Marked as published.", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Publish failed", "error");
    } finally {
      setBusy("idle");
    }
  }

  async function deleteBlog(): Promise<void> {
    if (!window.confirm("Delete this blog? This cannot be undone.")) return;
    setBusy("delete");
    try {
      const result = await fetchJson(`/api/blog/${blogId}`, {
        method: "DELETE",
      });
      if (!result.ok) throw new Error(result.error);
      toast("Blog deleted.", "success");
      router.push("/dashboard");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setBusy("idle");
    }
  }

  return (
    <div className="pb-24 lg:pb-4">
      {showNewBanner ? (
        <div className="mb-4 rounded-xl border border-brand/30 bg-brand/5 px-4 py-3 text-sm">
          <p className="font-medium text-foreground">Blog draft ready</p>
          <p className="mt-0.5 text-muted-foreground">
            Edit below, then mark as published when you&apos;re done.
          </p>
        </div>
      ) : null}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="size-4" />
            Dashboard
          </Button>
        </Link>
        <DraftStatusBadge status={blog.status} />
        <span
          className={cn(
            "text-xs",
            saveState === "error"
              ? "text-destructive"
              : "text-muted-foreground",
          )}
        >
          {isDirty
            ? saveState === "saving"
              ? "Saving…"
              : "Unsaved changes"
            : saveState === "saving"
              ? "Saving…"
              : "Saved"}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(14rem,18rem)_1fr]">
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{blog.title}</CardTitle>
              <CardDescription className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                Target {blog.readTimeMinutes} min · {estimatedRead} min actual
              </CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              <p>
                {wordCount} words
              </p>
              {blog.sourceTexts.length > 0 ? (
                <div className="mt-3">
                  <p className="mb-1.5 font-medium text-foreground">Sources</p>
                  <ul className="flex flex-col gap-1.5">
                    {blog.sourceTexts.map((s) => (
                      <li key={s.url}>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="line-clamp-2 text-xs text-brand hover:underline"
                        >
                          {s.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="secondary"
              disabled={busy !== "idle" || !isDirty}
              onClick={() => void saveBody()}
            >
              Save
            </Button>
            <Button
              type="button"
              disabled={busy !== "idle" || blog.status === "published"}
              onClick={() => void publish()}
            >
              Mark as published
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={busy !== "idle"}
              className="gap-1 text-destructive hover:text-destructive"
              onClick={() => void deleteBlog()}
            >
              {busy === "delete" ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Trash2 className="size-4" />
              )}
              Delete
            </Button>
          </div>
        </aside>

        <div className="min-w-0">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[60vh] font-mono text-sm leading-relaxed"
            placeholder="Blog content…"
          />
        </div>
      </div>
    </div>
  );
}
