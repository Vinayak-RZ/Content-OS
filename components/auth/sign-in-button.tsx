"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";

interface SignInButtonProps extends Omit<ButtonProps, "onClick"> {
  callbackUrl?: string;
  label?: string;
}

export function SignInButton({
  callbackUrl = "/dashboard",
  label = "Continue with Google",
  ...props
}: SignInButtonProps) {
  return (
    <Button
      type="button"
      onClick={() => void signIn("google", { callbackUrl })}
      {...props}
    >
      {label}
    </Button>
  );
}
