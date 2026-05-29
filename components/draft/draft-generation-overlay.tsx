"use client";

import { Loader2 } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type DraftGenerationOverlayProps = {
  title: string;
  text: string;
  statusMessage?: string | null;
  className?: string;
};

export function DraftGenerationOverlay({
  title,
  text,
  statusMessage,
  className,
}: DraftGenerationOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center bg-forest/40 p-4 backdrop-blur-sm sm:items-center",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-gen-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-subtle bg-card p-4 shadow-ambient sm:p-6">
        <div className="mb-3 flex items-center gap-2">
          <Loader2 className="size-4 animate-spin text-brand" aria-hidden />
          <h2
            id="draft-gen-title"
            className="font-heading text-base font-semibold text-foreground"
          >
            {title}
          </h2>
        </div>
        {statusMessage ? (
          <p className="mb-3 text-sm text-muted-foreground">{statusMessage}</p>
        ) : (
          <p className="mb-3 text-sm text-muted-foreground">
            Writing in your voice — you can read along as it streams.
          </p>
        )}
        <Textarea
          readOnly
          value={text}
          aria-label="Draft preview streaming"
          className="min-h-[min(50vh,360px)] resize-none bg-muted/20 text-[15px] leading-relaxed"
        />
      </div>
    </div>
  );
}
