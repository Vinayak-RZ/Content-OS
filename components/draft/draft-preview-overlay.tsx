"use client";

import { Copy, X } from "lucide-react";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { useFocusTrap } from "@/lib/client/focus-trap";
import { cn } from "@/lib/utils";

type DraftPreviewOverlayProps = {
  text: string;
  onClose: () => void;
  onCopy?: () => void;
  className?: string;
};

export function DraftPreviewOverlay({
  text,
  onClose,
  onCopy,
  className,
}: DraftPreviewOverlayProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useFocusTrap(true, panelRef, closeRef);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center bg-forest/40 p-4 backdrop-blur-sm sm:items-center",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-labelledby="draft-preview-title"
      onClick={onClose}
    >
      <div
        ref={panelRef}
        className="flex max-h-[min(90vh,720px)] w-full max-w-2xl flex-col rounded-xl border border-subtle bg-card shadow-ambient"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 border-b border-subtle px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <h2
              id="draft-preview-title"
              className="font-heading text-base font-semibold text-foreground"
            >
              Full post preview
            </h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Hook, body, and closing line as they will read when copied.
            </p>
          </div>
          <Button
            ref={closeRef}
            type="button"
            variant="ghost"
            size="sm"
            className="size-8 shrink-0 p-0"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X className="size-4" />
          </Button>
        </div>
        <div className="min-h-0 flex-1 overflow-auto px-4 py-4 sm:px-6 sm:py-5">
          <pre className="whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {text}
          </pre>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-subtle px-4 py-3 sm:px-6 sm:py-4">
          {onCopy ? (
            <Button type="button" variant="outline" className="gap-1" onClick={onCopy}>
              <Copy className="size-4" />
              Copy full post
            </Button>
          ) : null}
          <Button type="button" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
