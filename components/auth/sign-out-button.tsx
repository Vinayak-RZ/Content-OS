"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

export function SignOutButton(props: Omit<ButtonProps, "onClick">) {
  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void signOut({ callbackUrl: "/" })}
      {...props}
    >
      Sign out
    </Button>
  );
}
