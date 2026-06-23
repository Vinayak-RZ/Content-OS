"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";

type BufferSyncButtonProps = {
  connected: boolean;
  lastSyncAt: string | null;
  prominent?: boolean;
  showLastSync?: boolean;
};

export function BufferSyncButton({
  connected,
  lastSyncAt,
  prominent = false,
  showLastSync = true,
}: BufferSyncButtonProps) {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);

  if (!connected) return null;

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await fetchJson<{
        postsSynced: number;
        channelsSynced: number;
      }>("/api/buffer/sync", { method: "POST" });
      if (!result.ok) throw new Error(result.error);
      toast(
        `Refreshed ${result.data.postsSynced} post${result.data.postsSynced === 1 ? "" : "s"} from Buffer (${result.data.channelsSynced} channel${result.data.channelsSynced === 1 ? "" : "s"}).`,
        "success",
      );
      router.refresh();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Buffer refresh failed",
        "error",
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      {showLastSync ? (
        lastSyncAt ? (
          <p className="text-xs text-muted-foreground">
            Last refreshed {new Date(lastSyncAt).toLocaleString()}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Not synced yet</p>
        )
      ) : null}
      <Button
        type="button"
        variant={prominent ? "default" : "outline"}
        size={prominent ? "default" : "sm"}
        onClick={() => void handleSync()}
        disabled={syncing}
        aria-busy={syncing}
      >
        {syncing ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="mr-2 size-4" aria-hidden />
        )}
        {syncing ? "Refreshing…" : "Refresh from Buffer"}
      </Button>
    </div>
  );
}
