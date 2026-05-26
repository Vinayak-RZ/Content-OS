"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { formatDraftApiError } from "@/lib/client/draft-api-error";
import { Button } from "@/components/ui/button";

export function TopicDraftButton({
  trendId,
  size = "default",
  className,
}: {
  trendId: string;
  size?: "default" | "sm";
  className?: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function generateDraft(): Promise<void> {
    setBusy(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trendId }),
      });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(formatDraftApiError(json, `Generate failed (${res.status})`));
      }
      const id =
        typeof json === "object" &&
        json &&
        "draftId" in json &&
        typeof (json as { draftId?: string }).draftId === "string"
          ? (json as { draftId: string }).draftId
          : null;
      if (id) router.push(`/draft/${id}`);
    } finally {
      setBusy(false);
    }
  }

  const isSm = size === "sm";

  return (
    <Button
      type="button"
      size={size}
      disabled={busy}
      onClick={() => void generateDraft()}
      className={className}
      aria-label="Generate draft"
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" aria-hidden />
      ) : (
        <Sparkles className="size-4" aria-hidden />
      )}
      {isSm ? <span className="ml-1.5">Draft</span> : <span>Generate draft</span>}
    </Button>
  );
}
