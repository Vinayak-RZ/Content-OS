"use client";

import { useEffect, useState } from "react";
import { Bookmark } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { cn } from "@/lib/utils";

type TopicSaveToggleProps = {
  trendId: string;
  saved: boolean;
  size?: "sm" | "default";
  /** Icon only — for narrow topic cards */
  compact?: boolean;
  className?: string;
};

export function TopicSaveToggle({
  trendId,
  saved: savedProp,
  size = "sm",
  compact = false,
  className,
}: TopicSaveToggleProps) {
  const router = useRouter();
  const [saved, setSaved] = useState(savedProp);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSaved(savedProp);
  }, [savedProp]);

  async function toggle(): Promise<void> {
    const next = !saved;
    setSaved(next);
    setBusy(true);
    try {
      const result = await fetchJson(`/api/trends/${trendId}/feedback`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback: next ? "saved" : null }),
      });
      if (!result.ok) throw new Error(result.error);
      toast(
        next
          ? "Topic saved — it will not expire from your pool."
          : "Topic unsaved — it will expire with the rest of your backlog.",
        next ? "success" : "info",
      );
      router.refresh();
    } catch (e) {
      setSaved(!next);
      toast(
        e instanceof Error ? e.message : "Could not update save status.",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant={saved ? "default" : "outline"}
      size={size}
      disabled={busy}
      className={cn(
        "gap-1.5",
        saved && "bg-brand text-brand-foreground hover:bg-brand/90",
        className,
      )}
      onClick={() => void toggle()}
      aria-label={saved ? "Unsave topic" : "Save topic"}
      aria-pressed={saved}
      title={
        saved
          ? "Saved — stays in pool after expiry. Click to unsave."
          : "Save — keep in pool after the 10-day expiry"
      }
    >
      <Bookmark
        className={cn("size-4", saved && "fill-current")}
        aria-hidden
      />
      <span className={cn(!compact && "hidden sm:inline")}>
        {saved ? "Saved" : "Save"}
      </span>
    </Button>
  );
}
