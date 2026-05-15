import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NVIDIA_DRAFT, OPENROUTER_DRAFT } from "@/lib/llm/models";

interface DraftProviderFieldsProps {
  openrouterConfigured: boolean;
  nvidiaConfigured: boolean;
  /** When true, at least one draft key must be present on submit (onboarding). */
  requireOne?: boolean;
}

export function DraftProviderFields({
  openrouterConfigured,
  nvidiaConfigured,
  requireOne = false,
}: DraftProviderFieldsProps) {
  const hasEither = openrouterConfigured || nvidiaConfigured;

  return (
    <div className="space-y-6 rounded-xl border border-border/60 bg-muted/30 p-4">
      <div>
        <p className="text-sm font-medium text-foreground">Draft generation</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Paste <span className="font-medium text-foreground">one</span> API key below.
          {requireOne ? (
            <span className="text-brand"> Required to continue.</span>
          ) : (
            " At least one must stay configured."
          )}
        </p>
      </div>

      <DraftKeyField
        id="openrouterKey"
        name="openrouterKey"
        title="OpenRouter"
        modelLabel={OPENROUTER_DRAFT.displayName}
        modelId={OPENROUTER_DRAFT.modelId}
        configured={openrouterConfigured}
        required={requireOne && !hasEither}
      />

      <p className="text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
        or
      </p>

      <DraftKeyField
        id="nvidiaKey"
        name="nvidiaKey"
        title="NVIDIA NIM"
        modelLabel={NVIDIA_DRAFT.displayName}
        modelId={NVIDIA_DRAFT.modelId}
        configured={nvidiaConfigured}
        required={requireOne && !hasEither}
      />
    </div>
  );
}

function DraftKeyField({
  id,
  name,
  title,
  modelLabel,
  modelId,
  configured,
  required,
}: {
  id: string;
  name: string;
  title: string;
  modelLabel: string;
  modelId: string;
  configured: boolean;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Label htmlFor={id}>{title}</Label>
        {configured ? (
          <span className="text-xs text-brand">Configured</span>
        ) : (
          <span className="text-xs text-muted-foreground">Not set</span>
        )}
      </div>
      <p className="text-xs text-muted-foreground">
        Model: <span className="font-medium text-foreground">{modelLabel}</span>
        <span className="ml-1 font-mono text-[11px]">({modelId})</span>
      </p>
      <Input
        id={id}
        name={name}
        type="password"
        autoComplete="off"
        required={required && !configured}
        placeholder={configured ? "Leave blank to keep" : "Paste API key"}
      />
    </div>
  );
}
