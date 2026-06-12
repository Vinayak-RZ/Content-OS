import { randomUUID } from "crypto";

export type DraftRevisionKind =
  | "initial"
  | "manual"
  | "ai_edit"
  | "restore"
  | "x_thread";

export type DraftRevisionEntry = {
  id: string;
  at: string;
  kind: DraftRevisionKind;
  label: string;
  content: string;
  hookIx: number;
  ctaIx: number;
};

const MAX_REVISIONS = 30;

function normalizeRevisionHistory(raw: unknown): DraftRevisionEntry[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((x): x is Record<string, unknown> => x !== null && typeof x === "object")
    .map((x) => ({
      id: typeof x.id === "string" ? x.id : randomUUID(),
      at: typeof x.at === "string" ? x.at : new Date().toISOString(),
      kind: isRevisionKind(x.kind) ? x.kind : "manual",
      label: typeof x.label === "string" ? x.label : "Edit",
      content: typeof x.content === "string" ? x.content : "",
      hookIx: typeof x.hookIx === "number" ? x.hookIx : 0,
      ctaIx: typeof x.ctaIx === "number" ? x.ctaIx : 0,
    }))
    .filter((x) => x.content.length > 0);
}

function isRevisionKind(value: unknown): value is DraftRevisionKind {
  return (
    value === "initial" ||
    value === "manual" ||
    value === "ai_edit" ||
    value === "restore" ||
    value === "x_thread"
  );
}

export function parseDraftRevisions(raw: unknown): DraftRevisionEntry[] {
  return normalizeRevisionHistory(raw);
}

export function createInitialRevision(params: {
  content: string;
  hookIx?: number;
  ctaIx?: number;
}): DraftRevisionEntry[] {
  return [
    {
      id: randomUUID(),
      at: new Date().toISOString(),
      kind: "initial",
      label: "Initial draft",
      content: params.content,
      hookIx: params.hookIx ?? 0,
      ctaIx: params.ctaIx ?? 0,
    },
  ];
}

export function appendDraftRevision(
  rawHistory: unknown,
  entry: Omit<DraftRevisionEntry, "id"> & { id?: string },
): DraftRevisionEntry[] {
  const history = normalizeRevisionHistory(rawHistory);
  const next: DraftRevisionEntry = {
    id: entry.id ?? randomUUID(),
    at: entry.at,
    kind: entry.kind,
    label: entry.label,
    content: entry.content,
    hookIx: entry.hookIx,
    ctaIx: entry.ctaIx,
  };
  const merged = [...history, next];
  if (merged.length <= MAX_REVISIONS) return merged;
  const initial = merged.find((r) => r.kind === "initial");
  const tail = merged.slice(-(MAX_REVISIONS - (initial ? 1 : 0)));
  return initial && !tail.some((r) => r.id === initial.id)
    ? [initial, ...tail]
    : tail;
}

export function revisionLabelForCommand(command: string): string {
  const labels: Record<string, string> = {
    shortenLight: "AI: Trim lightly",
    shorten100: "AI: Shorter",
    shortenHeavy: "AI: Much shorter",
    rewrite: "AI: Rewrite",
    lessDramatic: "AI: Less dramatic",
    moreTechnical: "AI: More technical",
    founderFraming: "AI: Personal angle",
    strongerHook: "AI: Stronger opening",
    clearerExplanation: "AI: Clearer",
    addAnalogy: "AI: Add analogy",
    improveEnding: "AI: Better ending",
    addHashtags: "AI: More hashtags",
    custom: "AI: Custom edit",
  };
  return labels[command] ?? `AI: ${command}`;
}
