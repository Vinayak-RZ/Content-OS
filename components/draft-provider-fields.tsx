"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DRAFT_MODEL_CATALOG,
  DRAFT_PROVIDER_KINDS,
  DRAFT_PROVIDER_LABELS,
  type DraftProviderKind,
} from "@/lib/llm/models";
import type { SettingsResponse } from "@/lib/user-settings";

type DraftProviderSettingsProps = {
  settings: Pick<
    SettingsResponse,
    "keys" | "draftProvider" | "draftModelId" | "activeDraftProvider"
  >;
  /** Hide provider/model pickers (e.g. compact onboarding). */
  showProviderPicker?: boolean;
};

export function DraftProviderSettings({
  settings,
  showProviderPicker = true,
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

  return (
    <div className="space-y-6 rounded-xl border border-border/60 bg-muted/30 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Draft generation</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose a provider and model, then paste the matching API key. Keys are
          optional until you generate or edit a draft.
        </p>
      </div>

      {showProviderPicker ? (
        <>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium">Provider</legend>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              {DRAFT_PROVIDER_KINDS.map((kind) => (
                <label
                  key={kind}
                  className="flex cursor-pointer items-center gap-2 rounded-lg border border-border/60 bg-card px-3 py-2 text-sm shadow-pill has-[:checked]:border-brand has-[:checked]:ring-1 has-[:checked]:ring-brand"
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
        </>
      ) : null}

      <DraftKeyField
        id="openrouterKey"
        title={DRAFT_PROVIDER_LABELS.openrouter}
        configured={settings.keys.openrouter}
      />
      <DraftKeyField
        id="openaiKey"
        title={DRAFT_PROVIDER_LABELS.openai}
        configured={settings.keys.openai}
      />
      <DraftKeyField
        id="nvidiaKey"
        title={DRAFT_PROVIDER_LABELS.nvidia}
        configured={settings.keys.nvidia}
      />
    </div>
  );
}

function DraftKeyField({
  id,
  title,
  configured,
}: {
  id: string;
  title: string;
  configured: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{title} API key</Label>
        {configured ? (
          <span className="text-xs text-brand">Configured</span>
        ) : (
          <span className="text-xs text-muted-foreground">Not set</span>
        )}
      </div>
      <Input
        id={id}
        name={id}
        type="password"
        autoComplete="off"
        placeholder={configured ? "Leave blank to keep" : "Paste API key"}
      />
    </div>
  );
}

/** @deprecated Use DraftProviderSettings */
export const DraftProviderFields = DraftProviderSettings;
