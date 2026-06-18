"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";

type BufferSyncButtonProps = {
  connected: boolean;
  lastSyncAt: string | null;
};

export function BufferSyncButton({
  connected,
  lastSyncAt,
}: BufferSyncButtonProps) {
  const [syncing, setSyncing] = useState(false);

  if (!connected) return null;

  async function handleSync() {
    setSyncing(true);
    try {
      const result = await fetchJson<{ postsSynced: number }>(
        "/api/buffer/sync",
        { method: "POST" },
      );
      if (!result.ok) throw new Error(result.error);
      toast(
        `Synced ${result.data.postsSynced} post${result.data.postsSynced === 1 ? "" : "s"} from Buffer.`,
        "success",
      );
      window.location.reload();
    } catch (error) {
      toast(
        error instanceof Error ? error.message : "Buffer sync failed",
        "error",
      );
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {lastSyncAt ? (
        <p className="text-sm text-muted-foreground">
          Last synced {new Date(lastSyncAt).toLocaleString()}
        </p>
      ) : (
        <p className="text-sm text-muted-foreground">Not synced yet</p>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void handleSync()}
        disabled={syncing}
      >
        {syncing ? (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        ) : (
          <RefreshCw className="mr-2 size-4" aria-hidden />
        )}
        Sync now
      </Button>
    </div>
  );
}
