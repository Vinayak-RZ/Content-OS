"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";

import { DraftGenerationOverlay } from "@/components/draft/draft-generation-overlay";
import { generateDraftStream } from "@/lib/client/generate-draft-stream";
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
      router.push(`/draft/${result.draftId}`);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : formatDraftApiError(null, "Generate failed"),
      );
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
      >
        {busy ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Sparkles className="size-4" aria-hidden />
        )}
        {isSm ? <span className="ml-1.5">Draft</span> : <span>Generate draft</span>}
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
