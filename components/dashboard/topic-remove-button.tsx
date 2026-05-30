"use client";

import { useState } from "react";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { useRouter } from "next/navigation";

interface TopicRemoveButtonProps extends Omit<ButtonProps, "onClick"> {
  trendId: string;
  confirmMessage?: string;
}

export function TopicRemoveButton({
  trendId,
  confirmMessage = "Remove this topic from your pool? This cannot be undone.",
  children,
  ...props
}: TopicRemoveButtonProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove(): Promise<void> {
    if (!window.confirm(confirmMessage)) return;
    setBusy(true);
    try {
      const result = await fetchJson(`/api/trends/${trendId}`, {
        method: "DELETE",
      });
      if (!result.ok) throw new Error(result.error);
      toast("Topic removed.", "info");
      router.refresh();
    } catch (e) {
      toast(
        e instanceof Error ? e.message : "Failed to remove topic",
        "error",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void remove()}
      disabled={busy}
      aria-label="Remove topic"
      aria-busy={busy}
      {...props}
    >
      {busy ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        children ?? <Trash2 className="size-4" />
      )}
    </Button>
  );
}
