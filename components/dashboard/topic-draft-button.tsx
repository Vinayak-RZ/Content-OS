"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { DraftGenerationOverlay } from "@/components/draft/draft-generation-overlay";
import { generateDraftStream } from "@/lib/client/generate-draft-stream";
import { formatDraftApiError } from "@/lib/client/draft-api-error";
import { toast } from "@/lib/client/toast";
import { useAppRouter } from "@/lib/client/use-app-router";
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
  const router = useAppRouter();
  const [busy, setBusy] = useState(false);
  const [streamText, setStreamText] = useState("");
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generateDraft(): Promise<void> {
    setBusy(true);
    setStreamText("");
    setStatusMessage(null);
    setError(null);
    try {
      const result = await generateDraftStream({
        body: { trendId },
        onDelta: setStreamText,
        onStatus: setStatusMessage,
      });
      toast("Draft ready — keep editing or copy to LinkedIn.", "success");
      router.push(`/draft/${result.draftId}?new=1`);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : formatDraftApiError(null, "Generate failed");
      setError(message);
      toast(message, "error");
    } finally {
      setBusy(false);
      setStatusMessage(null);
    }
  }

  const isSm = size === "sm";

  return (
    <>
      <Button
        type="button"
        size={size}
        disabled={busy}
        onClick={() => void generateDraft()}
        className={className}
        aria-label="Generate draft"
        aria-busy={busy}
      >
        {busy ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            {isSm ? "Drafting…" : "Generating…"}
          </>
        ) : (
          <>
            <Sparkles className="size-4" aria-hidden />
            {isSm ? <span className="ml-1.5">Draft</span> : <span>Generate draft</span>}
          </>
        )}
      </Button>

      {busy ? (
        <DraftGenerationOverlay
          title="Generating draft"
          text={streamText}
          statusMessage={statusMessage}
        />
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}
