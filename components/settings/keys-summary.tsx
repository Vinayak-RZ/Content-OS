"use client";

import type { SettingsResponse } from "@/lib/user-settings";
import { countConfiguredKeys } from "@/lib/settings/keys-status";
import { cn } from "@/lib/utils";

const KEY_LABELS: { key: keyof SettingsResponse["keys"]; label: string }[] = [
  { key: "tavily", label: "Tavily" },
  { key: "firecrawl", label: "Firecrawl" },
  { key: "openrouter", label: "OpenRouter" },
  { key: "nvidia", label: "NVIDIA" },
  { key: "openai", label: "OpenAI" },
  { key: "buffer", label: "Buffer" },
];

export function KeysSummary({ keys }: { keys: SettingsResponse["keys"] }) {
  const { configured, total } = countConfiguredKeys(keys);

  return (
    <div className="rounded-xl border border-subtle bg-muted/30 px-4 py-3">
      <p className="font-heading text-sm font-semibold">
        API keys · {configured} of {total} connected
      </p>
      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
        {KEY_LABELS.map(({ key, label }) => (
          <li key={key} className="flex items-center gap-1.5 text-sm">
            <span
              className={cn(
                "size-2 rounded-full",
                keys[key] ? "bg-emerald-500" : "bg-muted-foreground/40",
              )}
              aria-hidden
            />
            <span className="text-muted-foreground">{label}</span>
            <span className="sr-only">
              {keys[key] ? "connected" : "not configured"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
