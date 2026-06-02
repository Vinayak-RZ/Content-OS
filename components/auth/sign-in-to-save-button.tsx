import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

export function SignInToSaveButton({
  size = "sm",
  className,
  callbackUrl = "/dashboard",
}: Pick<ButtonProps, "size" | "className"> & { callbackUrl?: string }) {
  const href =
    callbackUrl === "/dashboard"
      ? "/login"
      : `/login?callbackUrl=${encodeURIComponent(callbackUrl)}`;

  return (
    <Link href={href} className={className}>
      <Button type="button" variant="outline" size={size} className="w-full">
        Sign in to save
      </Button>
    </Link>
  );
}
