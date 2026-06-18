"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bot, FileText } from "lucide-react";

type InsightFile = {
  slug: string;
  fileName: string;
  displayName: string;
  content: string;
  fileVersion: number;
  updatedAt: string;
  lastImprovementRunId: string | null;
};

export function InsightFilesViewer() {
  const [files, setFiles] = useState<InsightFile[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/improve/insights");
      const data = (await res.json()) as { files?: InsightFile[] };
      const list = data.files ?? [];
      setFiles(list);
      setSelected((prev) => prev ?? list[0]?.slug ?? null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const active = files.find((f) => f.slug === selected);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading insight files…</p>;
  }

  if (files.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No agent insight files yet. Run an improvement cycle to generate them.
      </p>
    );
  }

  return (
    <div className="flex min-h-[20rem] flex-col gap-4 lg:flex-row">
      <aside className="w-full shrink-0 lg:w-56">
        <ul className="space-y-1">
          {files.map((file) => (
            <li key={file.slug}>
              <button
                type="button"
                onClick={() => setSelected(file.slug)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium transition-colors ${
                  selected === file.slug
                    ? "bg-card text-foreground shadow-pill"
                    : "text-muted-foreground hover:bg-muted/60"
                }`}
              >
                <FileText className="size-4 shrink-0" />
                <span className="truncate">{file.displayName}</span>
              </button>
            </li>
          ))}
        </ul>
        <Link
          href="/knowledge"
          className="mt-4 inline-block text-xs font-semibold text-brand hover:underline"
        >
          View in Knowledge →
        </Link>
      </aside>

      <div className="min-w-0 flex-1 rounded-xl border border-subtle bg-card">
        {active ? (
          <>
            <div className="flex flex-wrap items-center gap-2 border-b border-subtle px-4 py-3 sm:px-6">
              <Bot className="size-4 text-brand" />
              <span className="font-heading text-sm font-semibold">
                {active.displayName}
              </span>
              <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">
                Agent-managed
              </span>
              <span className="text-xs text-muted-foreground">
                v{active.fileVersion} ·{" "}
                {new Date(active.updatedAt).toLocaleDateString()}
              </span>
            </div>
            <pre className="max-h-[32rem] overflow-auto whitespace-pre-wrap p-4 font-mono text-sm leading-relaxed sm:p-6">
              {active.content}
            </pre>
          </>
        ) : null}
      </div>
    </div>
  );
}
