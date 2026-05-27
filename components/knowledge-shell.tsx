"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  KNOWLEDGE_ROLES,
  ROLE_DESCRIPTIONS,
  ROLE_LABELS,
  type KnowledgeRole,
} from "@/lib/knowledge/constants";

type ListFile = {
  slug: string;
  fileName: string;
  displayName: string;
  role: string;
  sortOrder: number;
  isSystem: boolean;
  updatedAt: string;
  fileVersion: number;
  chunkCount: number;
};

type KnowledgeShellProps = {
  initialFiles: ListFile[];
};

const ROLE_ORDER: KnowledgeRole[] = [
  "style",
  "narrative",
  "technical",
  "brand",
  "general",
];

function slugifyDisplayName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 49);
}

export function KnowledgeShell({ initialFiles }: KnowledgeShellProps) {
  const [files, setFiles] = useState<ListFile[]>(initialFiles);
  const [selected, setSelected] = useState<string | null>(
    initialFiles[0]?.slug ?? null,
  );
  const [content, setContent] = useState("");
  const [dirty, setDirty] = useState(false);
  const [loadingFile, setLoadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newSlug, setNewSlug] = useState("");
  const [newRole, setNewRole] = useState<KnowledgeRole>("general");
  const [slugTouched, setSlugTouched] = useState(false);
  const [mobileShowList, setMobileShowList] = useState(true);

  const loadList = useCallback(async () => {
    const res = await fetch("/api/knowledge");
    const data = (await res.json()) as { files?: ListFile[]; error?: string };
    if (!res.ok) {
      throw new Error(data.error ?? "List failed");
    }
    setFiles(data.files ?? []);
    return data.files ?? [];
  }, []);

  const loadFile = useCallback(async (slug: string) => {
    setLoadingFile(true);
    setErr(null);
    try {
      const res = await fetch(`/api/knowledge/${encodeURIComponent(slug)}`);
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
      setSelected(first.slug);
    }
  }, [files, selected]);

  useEffect(() => {
    if (selected) {
      void loadFile(selected);
    }
  }, [selected, loadFile]);

  const grouped = useMemo(() => {
    const map = new Map<KnowledgeRole, ListFile[]>();
    for (const role of ROLE_ORDER) {
      map.set(role, []);
    }
    for (const f of files) {
      const role = (ROLE_ORDER.includes(f.role as KnowledgeRole)
        ? f.role
        : "general") as KnowledgeRole;
      map.get(role)!.push(f);
    }
    return ROLE_ORDER.map((role) => ({
      role,
      label: ROLE_LABELS[role],
      items: map.get(role) ?? [],
    })).filter((g) => g.items.length > 0);
  }, [files]);

  const meta = useMemo(
    () => files.find((f) => f.slug === selected),
    [files, selected],
  );

  async function save() {
    if (!selected) return;
    setSaving(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/knowledge/${encodeURIComponent(selected)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Save failed");
      }
      setDirty(false);
      setMsg("Saved - chunks and embeddings updated.");
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
        `Import done. Created: ${created.length} document(s). Already had: ${skipped.length}.`,
      );
      const next = await loadList();
      if (next[0] && !selected) setSelected(next[0].slug);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Import failed");
    } finally {
      setSeeding(false);
    }
  }

  async function createDocument(opts?: {
    slug: string;
    displayName: string;
    role: KnowledgeRole;
    template?: "linkedin-profile";
  }) {
    setCreating(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch("/api/knowledge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          opts ?? {
            slug: newSlug.trim(),
            displayName: newDisplayName.trim(),
            role: newRole,
            content: "",
          },
        ),
      });
      const data = (await res.json()) as { slug?: string; error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Create failed");
      }
      setShowAdd(false);
      setNewDisplayName("");
      setNewSlug("");
      setNewRole("general");
      setSlugTouched(false);
      setMsg("Document created.");
      const next = await loadList();
      const slug = data.slug ?? opts?.slug;
      if (slug) {
        setSelected(slug);
      } else if (next[0]) {
        setSelected(next[0].slug);
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Create failed");
    } finally {
      setCreating(false);
    }
  }

  async function addLinkedInProfile() {
    const exists = files.some((f) => f.slug === "linkedin-profile");
    if (exists) {
      setSelected("linkedin-profile");
      setMsg("LinkedIn profile document already exists.");
      return;
    }
    await createDocument({
      slug: "linkedin-profile",
      displayName: "LinkedIn profile",
      role: "brand",
      template: "linkedin-profile",
    });
  }

  async function deleteSelected() {
    if (!selected || !meta) return;
    if (meta.isSystem) return;
    if (!confirm(`Delete "${meta.displayName}"? This cannot be undone.`)) {
      return;
    }
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(
        `/api/knowledge/${encodeURIComponent(selected)}`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Delete failed");
      }
      setSelected(null);
      setContent("");
      setDirty(false);
      setMsg("Document deleted.");
      const next = await loadList();
      if (next[0]) setSelected(next[0].slug);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
    }
  }

  async function resetSystemDoc() {
    if (!selected || !meta?.isSystem) return;
    if (
      !confirm(
        `Reset "${meta.displayName}" to the default template? Your edits will be replaced.`,
      )
    ) {
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      const res = await fetch(
        `/api/knowledge/${encodeURIComponent(selected)}?reset=true`,
        { method: "DELETE" },
      );
      const data = (await res.json()) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Reset failed");
      }
      setMsg("Reset to default template.");
      await loadFile(selected);
      await loadList();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Reset failed");
    } finally {
      setSaving(false);
    }
  }

  function selectSlug(slug: string) {
    if (dirty && !confirm("Discard unsaved edits?")) return;
    setSelected(slug);
    setMobileShowList(false);
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col lg:flex-row lg:gap-6">
      <div
        className={cn(
          "flex w-full shrink-0 flex-col border-b border-border/60 bg-sidebar/50 p-4 lg:w-64 lg:border-b-0 lg:border-r",
          mobileShowList ? "flex" : "hidden lg:flex",
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Documents
          </p>
          <button
            type="button"
            onClick={() => setShowAdd((v) => !v)}
            className="rounded-full border border-border/60 bg-card px-2.5 py-1 text-xs font-medium shadow-pill hover:bg-card/80"
          >
            {showAdd ? "Cancel" : "+ Add"}
          </button>
        </div>

        {showAdd ? (
          <form
            className="mb-4 space-y-2 rounded-2xl border border-border/60 bg-card p-3 text-sm shadow-pill"
            onSubmit={(e) => {
              e.preventDefault();
              void createDocument();
            }}
          >
            <label className="block text-xs text-muted-foreground">
              Display name
              <input
                value={newDisplayName}
                onChange={(e) => {
                  const v = e.target.value;
                  setNewDisplayName(v);
                  if (!slugTouched) {
                    setNewSlug(slugifyDisplayName(v));
                  }
                }}
                className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
                required
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Slug
              <input
                value={newSlug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setNewSlug(e.target.value.toLowerCase());
                }}
                pattern="[a-z0-9][a-z0-9-]*"
                className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 font-mono text-xs"
                required
              />
            </label>
            <label className="block text-xs text-muted-foreground">
              Role
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as KnowledgeRole)}
                className="mt-1 w-full rounded-lg border border-input bg-background px-2 py-1.5 text-sm"
              >
                {KNOWLEDGE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </select>
              <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                {ROLE_DESCRIPTIONS[newRole]}
              </span>
            </label>
            <button
              type="submit"
              disabled={creating}
              className="w-full rounded-full bg-brand py-2 text-xs font-medium text-white disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create document"}
            </button>
          </form>
        ) : null}

        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto">
          {files.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No documents yet. Import starter templates or add your first document.
            </p>
          ) : (
            grouped.map((group) => (
              <div key={group.role}>
                <p className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.label}
                </p>
                <div className="flex flex-col gap-1">
                  {group.items.map((f) => (
                    <button
                      key={f.slug}
                      type="button"
                      onClick={() => selectSlug(f.slug)}
                      className={`rounded-xl px-3 py-2 text-left text-sm font-medium transition-colors ${
                        f.slug === selected
                          ? "bg-card text-foreground shadow-pill"
                          : "text-muted-foreground hover:bg-card/60 hover:text-foreground"
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className="block truncate">{f.displayName}</span>
                        {f.isSystem ? (
                          <span
                            className="shrink-0 text-[10px] text-muted-foreground"
                            title="System document"
                          >
                            🔒
                          </span>
                        ) : null}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {f.chunkCount} chunks · {f.slug}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </nav>

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void addLinkedInProfile()}
            disabled={creating}
            className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium shadow-pill hover:bg-card/80 disabled:opacity-50"
          >
            + LinkedIn profile
          </button>
          <button
            type="button"
            onClick={() => void importSeeds()}
            disabled={seeding}
            className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium shadow-pill hover:bg-card/80 disabled:opacity-50"
          >
            {seeding ? "Importing…" : "Import starter templates"}
          </button>
        </div>
      </div>

      <div
        className={cn(
          "flex min-h-[50vh] flex-1 flex-col p-4 pt-4 sm:pt-6 lg:p-8",
          mobileShowList ? "hidden lg:flex" : "flex",
        )}
      >
        {selected && meta ? (
          <>
            <button
              type="button"
              onClick={() => setMobileShowList(true)}
              className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground lg:hidden"
            >
              <ArrowLeft className="size-4" />
              All documents
            </button>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{meta.displayName}</h2>
                <p className="text-xs text-muted-foreground">
                  {ROLE_LABELS[meta.role as KnowledgeRole] ?? meta.role} · v
                  {meta.fileVersion} · {meta.chunkCount} chunks · Updated{" "}
                  {new Date(meta.updatedAt).toLocaleString()}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {meta.isSystem ? (
                  <button
                    type="button"
                    onClick={() => void resetSystemDoc()}
                    disabled={saving}
                    className="rounded-full border border-border/60 bg-card px-4 py-2 text-sm font-medium shadow-pill hover:bg-card/80 disabled:opacity-50"
                  >
                    Reset template
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void deleteSelected()}
                    className="rounded-full border border-red-200 bg-card px-4 py-2 text-sm font-medium text-red-700 shadow-pill hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => void save()}
                  disabled={saving || !dirty || loadingFile}
                  className="rounded-full bg-brand px-5 py-2 text-sm font-medium text-white shadow-pill disabled:opacity-50"
                >
                  {saving ? "Saving…" : "Save & re-embed"}
                </button>
              </div>
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
                className="min-h-[280px] flex-1 resize-y rounded-2xl border border-input bg-card p-4 font-mono text-sm leading-relaxed shadow-pill focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:min-h-[480px]"
                aria-label="Knowledge document content"
              />
            )}
          </>
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 text-center">
            <p className="max-w-md text-muted-foreground">
              Import starter templates, create custom documents (notes, LinkedIn
              profile, etc.), then save to chunk and embed with{" "}
              <span className="font-medium">OPENAI_API_KEY</span>.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => void addLinkedInProfile()}
                disabled={creating}
                className="rounded-full border border-border/60 bg-card px-5 py-2.5 text-sm font-medium shadow-pill"
              >
                + LinkedIn profile
              </button>
              <button
                type="button"
                onClick={() => void importSeeds()}
                disabled={seeding}
                className="rounded-full bg-brand px-6 py-2.5 text-sm font-medium text-white shadow-pill disabled:opacity-50"
              >
                {seeding ? "Importing…" : "Import starter templates"}
              </button>
            </div>
          </div>
        )}
        {msg ? <p className="mt-3 text-sm text-brand">{msg}</p> : null}
        {err ? <p className="mt-3 text-sm text-red-600">{err}</p> : null}
      </div>
    </div>
  );
}
