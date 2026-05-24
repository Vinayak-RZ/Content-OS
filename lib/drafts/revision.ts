function normalizeRevisionHistory(raw: unknown): Record<string, unknown>[] {
  return Array.isArray(raw)
    ? raw.filter((x): x is Record<string, unknown> => x !== null && typeof x === "object")
    : [];
}

export function appendDraftRevision(
  rawHistory: unknown,
  entry: Record<string, unknown>,
): Record<string, unknown>[] {
  return [...normalizeRevisionHistory(rawHistory), entry];
}
