"use client";

import { useEffect, useState } from "react";

import { ApiKeyField } from "@/components/ui/api-key-field";
import { Label } from "@/components/ui/label";
import { fetchJson } from "@/lib/client/fetch-json";
import { PROVIDER_LINKS } from "@/lib/provider-links";
import type { SettingsResponse } from "@/lib/user-settings";

type BufferOrganization = { id: string; name: string };

type BufferSettingsCardProps = {
  settings: Pick<
    SettingsResponse,
    | "keys"
    | "bufferOrganizationId"
    | "bufferLastSyncAt"
    | "bufferLastSyncError"
  >;
};

export function BufferSettingsCard({ settings }: BufferSettingsCardProps) {
  const [organizations, setOrganizations] = useState<BufferOrganization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(false);

  useEffect(() => {
    if (!settings.keys.buffer) {
      setOrganizations([]);
      return;
    }

    let cancelled = false;
    setLoadingOrgs(true);
    void fetchJson<{ organizations: BufferOrganization[] }>(
      "/api/buffer/organizations",
    ).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setOrganizations(result.data.organizations);
      }
      setLoadingOrgs(false);
    });

    return () => {
      cancelled = true;
    };
  }, [settings.keys.buffer]);

  return (
    <div className="space-y-4 rounded-xl border border-subtle bg-muted/20 p-4 sm:p-5">
      <ApiKeyField
        id="bufferApiKey"
        name="bufferApiKey"
        label="Buffer API key"
        configured={settings.keys.buffer}
        provider={PROVIDER_LINKS.buffer}
        variant="panel"
      />

      {settings.keys.buffer ? (
        <div className="space-y-2">
          <Label htmlFor="bufferOrganizationId">Organization</Label>
          <select
            id="bufferOrganizationId"
            name="bufferOrganizationId"
            defaultValue={settings.bufferOrganizationId ?? ""}
            disabled={loadingOrgs}
            className="flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">
              {loadingOrgs ? "Loading organizations…" : "Select organization"}
            </option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
          {settings.bufferLastSyncAt ? (
            <p className="text-xs text-muted-foreground">
              Last synced{" "}
              {new Date(settings.bufferLastSyncAt).toLocaleString()}
            </p>
          ) : null}
          {settings.bufferLastSyncError ? (
            <p className="text-xs text-red-600">{settings.bufferLastSyncError}</p>
          ) : null}
        </div>
      ) : null}

      {settings.keys.buffer ? (
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" name="clearBuffer" className="accent-brand" />
          Disconnect Buffer
        </label>
      ) : null}
    </div>
  );
}
