"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CopyButtonProps = {
  text: string;
  label?: string;
  copiedLabel?: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "outline" | "ghost" | "brandOutline";
  className?: string;
};

export function CopyButton({
  text,
  label = "Copy",
  copiedLabel = "Copied",
  size = "sm",
  variant = "outline",
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button
      type="button"
      size={size}
      variant={variant}
      className={cn("gap-1.5", className)}
      onClick={() => void handleCopy()}
    >
      {copied ? (
        <>
          <Check className="size-4" />
          {copiedLabel}
        </>
      ) : (
        <>
          <Copy className="size-4" />
          {label}
        </>
      )}
    </Button>
  );
}
