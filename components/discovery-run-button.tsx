"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function DiscoveryRunButton({
  onCompleted,
  compact,
}: {
  onCompleted?: () => void | Promise<void>;
  compact?: boolean;
}) {
  const [status, setStatus] = useState<"idle" | "running" | "done" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setStatus("running");
    setMessage(null);
    try {
      const res = await fetch("/api/discover", { method: "POST" });
      const json: unknown = await res.json().catch(() => ({}));
      if (!res.ok) {
        const errObj = json && typeof json === "object" ? json : {};
        const errMsg =
          "error" in errObj &&
          typeof (errObj as { error?: unknown }).error === "string"
            ? (errObj as { error: string }).error
            : res.statusText;
        throw new Error(errMsg);
      }
      const body = json && typeof json === "object" ? json : {};
      const newStored = (body as { newStored?: number }).newStored ?? 0;
      const carried = (body as { carriedOver?: number }).carriedOver ?? 0;
      setStatus("done");
      setMessage(`Added ${newStored} new trends; ${carried} carried from your queue.`);
      await onCompleted?.();
    } catch (e) {
      setStatus("error");
      setMessage(e instanceof Error ? e.message : "Discovery failed.");
    }
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        onClick={() => void run()}
        disabled={status === "running"}
        variant="secondary"
        size={compact ? "sm" : "default"}
      >
        {status === "running" ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Running discovery…
          </>
        ) : (
          "Run discovery now"
        )}
      </Button>
      {message ? (
        <p
          className={
            status === "error"
              ? "text-sm text-destructive"
              : "text-sm text-muted-foreground"
          }
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
