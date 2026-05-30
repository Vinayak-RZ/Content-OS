"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";

export function DiscoveryRunButton({
  onCompleted,
  compact,
  className,
}: {
  onCompleted?: () => void | Promise<void>;
  compact?: boolean;
  className?: string;
}) {
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    try {
      const result = await fetchJson<{
        newStored?: number;
        carriedOver?: number;
      }>("/api/discover", { method: "POST" });

      if (!result.ok) {
        throw new Error(result.error);
      }

      const newStored = result.data.newStored ?? 0;
      const carried = result.data.carriedOver ?? 0;
      toast(
        `Added ${newStored} new topic${newStored === 1 ? "" : "s"}; ${carried} carried from your queue.`,
        "success",
      );
      await onCompleted?.();
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "Discovery failed. Try again.",
        "error",
      );
    } finally {
      setRunning(false);
    }
  }

  return (
    <Button
      type="button"
      onClick={() => void run()}
      disabled={running}
      variant="secondary"
      size={compact ? "sm" : "default"}
      className={className}
    >
      {running ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          Running discovery…
        </>
      ) : (
        "Run discovery"
      )}
    </Button>
  );
}
