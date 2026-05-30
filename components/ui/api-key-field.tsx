import Link from "next/link";
import { ExternalLink } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProviderLink } from "@/lib/provider-links";

type ApiKeyFieldProps = {
  id: string;
  label: string;
  configured: boolean;
  provider?: ProviderLink;
  /** Override input name when id differs from form field name */
  name?: string;
  /** Padded cell for dense settings grids */
  variant?: "default" | "panel";
};

export function ApiKeyField({
  id,
  label,
  configured,
  provider,
  name,
  variant = "default",
}: ApiKeyFieldProps) {
  const inner = (
    <>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {configured ? (
          <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
            Connected
          </span>
        ) : (
          <span className="text-xs text-muted-foreground">Not set</span>
        )}
      </div>
      {provider ? (
        <p className="text-xs leading-relaxed text-muted-foreground">
          {provider.blurb}{" "}
          <Link
            href={provider.signupUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-0.5 font-medium text-brand underline-offset-4 hover:underline"
          >
            {provider.signupLabel}
            <ExternalLink className="size-3 shrink-0" aria-hidden />
          </Link>
        </p>
      ) : null}
      <Input
        id={id}
        name={name ?? id}
        type="password"
        autoComplete="off"
        placeholder={
          configured ? "Leave blank to keep current key" : "Paste API key"
        }
      />
    </>
  );

  if (variant === "panel") {
    return (
      <div className="flex h-full flex-col gap-3 rounded-xl border border-subtle bg-muted/15 p-4">
        {inner}
      </div>
    );
  }

  return <div className="space-y-2">{inner}</div>;
}
