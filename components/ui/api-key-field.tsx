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
};

export function ApiKeyField({
  id,
  label,
  configured,
  provider,
  name,
}: ApiKeyFieldProps) {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Label htmlFor={id}>{label}</Label>
        {configured ? (
          <span className="text-xs text-brand">Configured</span>
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
        placeholder={configured ? "Leave blank to keep current key" : "Paste API key"}
      />
    </div>
  );
}
