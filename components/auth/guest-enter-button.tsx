"use client";

import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

export function GuestEnterButton({
  className,
  size = "lg",
  variant = "outline",
}: Pick<ButtonProps, "className" | "size" | "variant">) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      disabled={busy}
      onClick={() => {
        setBusy(true);
        router.push("/api/guest/enter");
      }}
    >
      {busy ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
          Opening…
        </>
      ) : (
        "Use as guest"
      )}
    </Button>
  );
}
