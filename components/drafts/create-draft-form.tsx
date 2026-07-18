"use client";

import { Loader2, PenLine, Plus } from "lucide-react";
import { useState } from "react";

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
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { useAppRouter } from "@/lib/client/use-app-router";

export function CreateDraftForm({ defaultExpanded = false }: { defaultExpanded?: boolean }) {
  const router = useAppRouter();
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [busy, setBusy] = useState(false);

  async function createDraft(): Promise<void> {
    if (!title.trim()) {
      toast("Enter a title for your draft.", "error");
      return;
    }
    setBusy(true);
    try {
      const result = await fetchJson<{ draftId: string }>("/api/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topicTitle: title.trim(),
          currentContent: content.trim() || undefined,
        }),
      });
      if (!result.ok) throw new Error(result.error);
      toast("Draft created.", "success");
      router.push(`/draft/${result.data.draftId}?new=1`);
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not create draft", "error");
    } finally {
      setBusy(false);
    }
  }

  if (!expanded) {
    return (
      <Button
        type="button"
        onClick={() => setExpanded(true)}
        className="gap-1.5 self-start"
      >
        <Plus className="size-4" />
        New draft
      </Button>
    );
  }

  return (
    <Card className="border-border/80 shadow-pill">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <PenLine className="size-5 text-brand" />
          New draft
        </CardTitle>
        <CardDescription>
          Start from scratch — no topic signal or AI generation required. You
          can edit hooks, body, and closing lines in the editor.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2">
          <Label htmlFor="new-draft-title">Title</Label>
          <Input
            id="new-draft-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What is this post about?"
            autoFocus
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="new-draft-body">Opening notes (optional)</Label>
          <Textarea
            id="new-draft-body"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Paste a rough take, bullets, or leave blank and write in the editor…"
            className="min-h-[120px]"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            disabled={busy || !title.trim()}
            onClick={() => void createDraft()}
            className="gap-1.5"
          >
            {busy ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating…
              </>
            ) : (
              "Create draft"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={() => {
              setExpanded(false);
              setTitle("");
              setContent("");
            }}
          >
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
