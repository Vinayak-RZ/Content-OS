"use client";

import { useMemo, useState } from "react";

import { ApiKeyField } from "@/components/ui/api-key-field";
import { Label } from "@/components/ui/label";
import {
  DRAFT_MODEL_CATALOG,
  DRAFT_PROVIDER_KINDS,
  DRAFT_PROVIDER_LABELS,
  type DraftProviderKind,
} from "@/lib/llm/models";
import { PROVIDER_LINKS } from "@/lib/provider-links";
import type { SettingsResponse } from "@/lib/user-settings";

const DRAFT_KEY_FIELDS: Record<
  DraftProviderKind,
  { id: string; key: keyof SettingsResponse["keys"] }
> = {
  openrouter: { id: "openrouterKey", key: "openrouter" },
  openai: { id: "openaiKey", key: "openai" },
  nvidia: { id: "nvidiaKey", key: "nvidia" },
};

type DraftProviderSettingsProps = {
  settings: Pick<
    SettingsResponse,
    "keys" | "draftProvider" | "draftModelId" | "activeDraftProvider"
  >;
  /** Hide provider/model pickers (e.g. compact onboarding). */
  showProviderPicker?: boolean;
  /** Show all provider keys or only the selected one. */
  showAllProviderKeys?: boolean;
  /** Flat layout for embedding inside a parent card (no nested box/title). */
  embedded?: boolean;
  /** Include Tavily + Firecrawl in a separate discovery section (settings page). */
  includeDiscoveryKeys?: boolean;
};

export function DraftProviderSettings({
  settings,
  showProviderPicker = true,
  showAllProviderKeys = false,
  embedded = false,
  includeDiscoveryKeys = false,
}: DraftProviderSettingsProps) {
  const initialProvider =
    settings.draftProvider ??
    settings.activeDraftProvider ??
    ("openrouter" as DraftProviderKind);

  const [provider, setProvider] = useState<DraftProviderKind>(initialProvider);

  const modelOptions = useMemo(
    () => DRAFT_MODEL_CATALOG[provider],
    [provider],
  );

  const defaultModel =
    settings.draftProvider === provider && settings.draftModelId
      ? settings.draftModelId
      : (modelOptions[0]?.modelId ?? "");

  const visibleProviders = showAllProviderKeys
    ? DRAFT_PROVIDER_KINDS
    : ([provider] as DraftProviderKind[]);

  const keyVariant = embedded ? "panel" : "default";

  return (
    <div
      className={
        embedded
          ? "space-y-8"
          : "space-y-6 rounded-xl border border-border/60 bg-muted/30 p-4"
      }
    >
      {!embedded ? (
        <div>
          <p className="text-sm font-medium text-foreground">Draft generation</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Choose a provider and model, then paste the matching API key. Keys are
            optional until you generate or edit a draft.
          </p>
        </div>
      ) : null}

      {showProviderPicker ? (
        <div className="rounded-xl border border-subtle bg-muted/20 p-4 sm:p-5">
          <div className="grid gap-5 xl:grid-cols-[1fr_minmax(14rem,22rem)] xl:items-end">
            <fieldset className="space-y-3">
              <legend className="text-sm font-medium">Draft provider</legend>
              <div className="flex flex-wrap gap-2">
                {DRAFT_PROVIDER_KINDS.map((kind) => (
                  <label
                    key={kind}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2.5 text-sm shadow-pill has-[:checked]:border-brand has-[:checked]:ring-1 has-[:checked]:ring-brand"
                  >
                    <input
                      type="radio"
                      name="draftProvider"
                      value={kind}
                      checked={provider === kind}
                      onChange={() => setProvider(kind)}
                      className="accent-brand"
                    />
                    {DRAFT_PROVIDER_LABELS[kind]}
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label htmlFor="draftModelId">Model</Label>
              <select
                id="draftModelId"
                name="draftModelId"
                key={provider}
                defaultValue={defaultModel}
                className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {modelOptions.map((m) => (
                  <option key={m.modelId} value={m.modelId}>
                    {m.displayName} ({m.modelId})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : null}

      <div className={embedded ? "space-y-4" : "space-y-4"}>
        {embedded ? (
          <p className="text-sm font-medium text-foreground">Draft API keys</p>
        ) : null}
        <div
          className={
            embedded
              ? "grid gap-4 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {visibleProviders.map((kind) => {
            const field = DRAFT_KEY_FIELDS[kind];
            return (
              <ApiKeyField
                key={kind}
                id={field.id}
                label={`${DRAFT_PROVIDER_LABELS[kind]} API key`}
                configured={settings.keys[field.key]}
                provider={PROVIDER_LINKS[kind]}
                variant={keyVariant}
              />
            );
          })}
        </div>
      </div>

      {includeDiscoveryKeys ? (
        <div className="space-y-4 border-t border-subtle pt-8">
          <div>
            <p className="text-sm font-medium text-foreground">
              Discovery &amp; scraping
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Optional keys for topic search and URL fetching.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <ApiKeyField
              id="tavilyApiKey"
              label="Tavily"
              configured={settings.keys.tavily}
              provider={PROVIDER_LINKS.tavily}
              variant={keyVariant}
            />
            <ApiKeyField
              id="firecrawlApiKey"
              label="Firecrawl"
              configured={settings.keys.firecrawl}
              provider={PROVIDER_LINKS.firecrawl}
              variant={keyVariant}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** @deprecated Use DraftProviderSettings */
export const DraftProviderFields = DraftProviderSettings;
