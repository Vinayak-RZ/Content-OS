"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import type { SerializedDashboardTrend } from "@/lib/trends/types";

type DiscoverResponse = {
  newStored?: number;
  carriedOver?: number;
  batchId?: string;
  topics?: SerializedDashboardTrend[];
};

export function DiscoveryRunButton({
  onCompleted,
  onGuestCompleted,
  guest,
  compact,
  className,
}: {
  onCompleted?: () => void | Promise<void>;
  onGuestCompleted?: (data: DiscoverResponse) => void | Promise<void>;
  guest?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const [running, setRunning] = useState(false);

  async function run() {
    setRunning(true);
    try {
      const endpoint = guest ? "/api/discover/guest" : "/api/discover";
      const result = await fetchJson<DiscoverResponse>(endpoint, {
        method: "POST",
      });

      if (!result.ok) {
        throw new Error(result.error);
      }

      const newStored = result.data.newStored ?? 0;
      const carried = result.data.carriedOver ?? 0;
      if (guest) {
        await onGuestCompleted?.(result.data);
        toast(
          `Found ${newStored} new topic${newStored === 1 ? "" : "s"} (guest preview — sign in to save).`,
          "success",
        );
      } else {
        toast(
          `Added ${newStored} new topic${newStored === 1 ? "" : "s"}; ${carried} carried from your queue.`,
          "success",
        );
        await onCompleted?.();
      }
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
