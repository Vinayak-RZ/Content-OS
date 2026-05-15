"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

type ListFile = {
  fileName: string;
  updatedAt: string;
  fileVersion: number;
  chunkCount: number;
};

type KnowledgeShellProps = {
  initialFiles: ListFile[];
};

export function KnowledgeShell({ initialFiles }: KnowledgeShellProps) {
  const [files, setFiles] = useState<ListFile[]>(initialFiles);
  const [selected, setSelected] = useState<string | null>(
    initialFiles[0]?.fileName ?? null,
  );
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const loadList = useCallback(async () => {
    const res = await fetch("/api/knowledge");
    const data = (await res.json()) as { files?: ListFile[] };
    if (!res.ok) {
      throw new Error((data as { error?: string }).error ?? "List failed");
    }
    setFiles(data.files ?? []);
    return data.files ?? [];
  }, []);

  const loadFile = useCallback(async (fileName: string) => {
    setLoadingFile(true);
    setErr(null);
    try {
      const enc = encodeURIComponent(fileName);
      const res = await fetch(`/api/knowledge/${enc}`);
      const data = (await res.json()) as {
        content?: string;
        error?: string;
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to load file");
      }
      setContent(data.content ?? "");
      setDirty(false);
    } finally {
      setLoadingFile(false);
    }
  }, []);

  useEffect(() => {
    const first = files[0];
    if (first && !selected) {
      setSelected(first.fileName);
    }
  }, [files, selected]);

  useEffect(() => {
    if (selected) {
      void loadFile(selected);
    }
  }, [selected, loadFile]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      const enc = encodeURIComponent(selected);
      const res = await fetch(`/api/knowledge/${enc}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await res.json()) as { error?: string; fileVersion?: number };
      if (!res.ok) {
        throw new Error(data.error ?? "Save failed");
      }
      setDirty(false);
      setMsg("Saved — chunks and embeddings updated.");
      await loadList();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function importSeeds() {
    setSeeding(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/knowledge/seed", { method: "POST" });
      const data = (await res.json()) as {
        error?: string;
        created?: string[];
        skipped?: string[];
      };
      if (!res.ok) {
        throw new Error(data.error ?? "Import failed");
      }
      const created = data.created ?? [];
      const skipped = data.skipped ?? [];
      setMsg(
        `Import done. Created: ${created.length} file(s). Already had: ${skipped.length}.`,
      );
      const next = await loadList();
      if (next[0] && !selected) setSelected(next[0].fileName);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Import failed");
    } finally {
      setSeeding(false);
    }
  }

  const meta = useMemo(
    () => files.find((f) => f.fileName === selected),
    [files, selected],
  );

  return (
    <div className="flex min-h-0 flex-1 gap-0 lg:gap-6">
      <div className="flex w-full shrink-0 flex-col border-b border-border/60 bg-sidebar/50 p-4 lg:w-56 lg:border-b-0 lg:border-r">
        <p className="mb-3 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Files
        </p>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No knowledge files yet. Import the six founder seeds to get started.
            </p>
          ) : (
            files.map((f) => (
              <button
                key={f.fileName}
                type="button"
                onClick={() => {
                  if (dirty && !confirm("Discard unsaved edits?")) return;
                  setSelected(f.fileName);
                }}
                className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                  f.fileName === selected
                    ? "bg-card text-foreground shadow-pill"
                    : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                }`}
              >
                <span className="block truncate">{f.fileName}</span>
                <span className="text-xs font-normal text-muted-foreground">
                  {f.chunkCount} chunks
                </span>
              </button>
            ))
          )}
        </nav>
        <button
          type="button"
          onClick={() => void importSeeds()}
          disabled={seeding}
          className="mt-4 rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium shadow-pill hover:bg-card/80 disabled:opacity-50"
        >
          {seeding ? "Importing…" : "Import founder seeds"}
        </button>
      </div>

      <div className="flex min-h-[50vh] flex-1 flex-col p-4 lg:p-8 pt-6">
        {selected ? (
          <>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{selected}</h2>
                {meta ? (
                  <p className="text-xs text-muted-foreground">
                    v{meta.fileVersion} · {meta.chunkCount} chunks · Updated{" "}
                    {new Date(meta.updatedAt).toLocaleString()}
                  </p>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => void save()}
                disabled={saving || !dirty || loadingFile}
                className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white shadow-pill disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save & re-embed"}
              </button>
            </div>
            {loadingFile ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : (
              <textarea
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  setDirty(true);
                }}
                spellCheck={false}
                className="min-h-[480px] flex-1 resize-y rounded-2xl border border-input bg-card p-4 font-mono text-sm leading-relaxed shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Knowledge file content"
              />
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-md text-muted-foreground">
              Import the six canonical founder markdown files (writing style, soul,
              interests, etc.). They live in <code className="rounded bg-muted px-1 py-0.5 text-xs">seeds/founder</code>{" "}
              in the repo and require <span className="font-medium">OPENAI_API_KEY</span>{" "}
              for embeddings.
            </p>
            <button
              type="button"
              onClick={() => void importSeeds()}
              disabled={seeding}
              className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white shadow-pill disabled:opacity-50"
            >
              {seeding ? "Importing…" : "Import founder seeds"}
            </button>
          </div>
        )}
        {msg ? <p className="mt-3 text-sm text-brand">{msg}</p> : null}
        {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
      </div>
    </div>
  );
}
