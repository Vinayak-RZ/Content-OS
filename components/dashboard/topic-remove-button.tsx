"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

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
      const res = await fetch(`/api/trends/${trendId}`, { method: "DELETE" });
      if (!res.ok) {
        const json: unknown = await res.json().catch(() => ({}));
        const message =
          typeof json === "object" &&
          json &&
          "error" in json &&
          typeof (json as { error?: string }).error === "string"
            ? (json as { error: string }).error
            : "Failed to remove topic";
        throw new Error(message);
      }
      router.refresh();
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "Failed to remove topic");
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
