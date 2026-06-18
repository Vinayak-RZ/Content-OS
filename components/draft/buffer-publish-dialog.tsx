"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";

type BufferChannelOption = {
  id: string;
  service: string;
  platform: string;
  name: string;
};

type BufferPublishDialogProps = {
  draftId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPublished: (socialPostId: string) => void;
};

export function BufferPublishDialog({
  draftId,
  open,
  onOpenChange,
  onPublished,
}: BufferPublishDialogProps) {
  const [channels, setChannels] = useState<BufferChannelOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [channelId, setChannelId] = useState("");
  const [schedule, setSchedule] = useState(false);
  const [dueAt, setDueAt] = useState("");

  useEffect(() => {
    if (!open) return;

    let cancelled = false;
    setLoading(true);
    void fetchJson<{ channels: BufferChannelOption[] }>(
      "/api/buffer/channels?refresh=1",
    ).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setChannels(result.data.channels);
        if (result.data.channels[0]) {
          setChannelId(result.data.channels[0].id);
        }
      } else {
        toast(result.error, "error");
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  async function handlePublish() {
    if (!channelId) {
      toast("Select a channel.", "error");
      return;
    }
    if (schedule && !dueAt) {
      toast("Choose a schedule time.", "error");
      return;
    }

    setPublishing(true);
    try {
      const result = await fetchJson<{
        socialPostId: string;
        status: string;
      }>("/api/buffer/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          draftId,
          channelId,
          mode: schedule ? "customScheduled" : "addToQueue",
          dueAt: schedule ? new Date(dueAt).toISOString() : undefined,
        }),
      });
      if (!result.ok) throw new Error(result.error);
      toast(
        result.data.status === "sent"
          ? "Published to Buffer."
          : "Queued in Buffer.",
        "success",
      );
      onPublished(result.data.socialPostId);
      onOpenChange(false);
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Could not publish to Buffer",
        "error",
      );
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="buffer-publish-title"
    >
      <div className="w-full max-w-md rounded-xl border border-subtle bg-card p-6 shadow-ambient">
        <h2 id="buffer-publish-title" className="font-heading text-lg font-semibold">
          Publish to Buffer
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          LinkedIn channels publish the assembled post. X channels require a
          generated thread.
        </p>

        {loading ? (
          <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Loading channels…
          </div>
        ) : channels.length === 0 ? (
          <p className="mt-6 text-sm text-muted-foreground">
            No LinkedIn or X channels found.{" "}
            <Link href="/settings" className="text-brand hover:underline">
              Connect Buffer
            </Link>{" "}
            and sync your channels.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="buffer-channel">Channel</Label>
              <select
                id="buffer-channel"
                value={channelId}
                onChange={(e) => setChannelId(e.target.value)}
                className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {channels.map((ch) => (
                  <option key={ch.id} value={ch.id}>
                    {ch.platform} · {ch.name}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={schedule}
                onChange={(e) => setSchedule(e.target.checked)}
                className="accent-brand"
              />
              Schedule for a specific time
            </label>

            {schedule ? (
              <div className="space-y-2">
                <Label htmlFor="buffer-due-at">Publish at</Label>
                <input
                  id="buffer-due-at"
                  type="datetime-local"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  className="flex h-10 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            ) : null}
          </div>
        )}

        <div className="mt-6 flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={publishing}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handlePublish()}
            disabled={publishing || loading || channels.length === 0}
          >
            {publishing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Publishing…
              </>
            ) : (
              "Publish"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
