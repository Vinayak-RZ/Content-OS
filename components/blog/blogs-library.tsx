"use client";

import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SerializedBlogSummary } from "@/lib/blogs/types";
import { fetchJson } from "@/lib/client/fetch-json";
import { toast } from "@/lib/client/toast";
import { useAppRouter } from "@/lib/client/use-app-router";

export function BlogsLibrary({
  initialBlogs,
}: {
  initialBlogs: SerializedBlogSummary[];
}) {
  const router = useAppRouter();
  const [blogs, setBlogs] = useState(initialBlogs);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      const result = await fetchJson(`/api/blog/${id}`, { method: "DELETE" });
      if (!result.ok) throw new Error(result.error);
      setBlogs((prev) => prev.filter((b) => b.id !== id));
      toast("Blog deleted.", "success");
      router.refresh();
    } catch (e) {
      toast(e instanceof Error ? e.message : "Delete failed", "error");
    } finally {
      setDeletingId(null);
    }
  }

  if (blogs.length === 0) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-subtle bg-card shadow-ambient">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[32rem] text-left text-sm">
          <thead>
            <tr className="border-b border-subtle bg-muted/30 text-xs uppercase tracking-wide text-muted-foreground">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium">Read time</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Updated</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {blogs.map((blog) => (
              <tr
                key={blog.id}
                className="border-b border-subtle/60 last:border-0 hover:bg-muted/20"
              >
                <td className="px-4 py-3">
                  <Link
                    href={`/blog/${blog.id}`}
                    className="font-medium text-foreground hover:text-brand"
                  >
                    {blog.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <Clock className="size-3.5" />
                    {blog.estimatedReadMinutes > 0
                      ? `${blog.estimatedReadMinutes} min`
                      : `${blog.readTimeMinutes} min target`}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={blog.status === "published" ? "forest" : "muted"}
                  >
                    {blog.status}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(blog.updatedAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="size-8 px-2 text-destructive hover:text-destructive"
                    disabled={deletingId === blog.id}
                    onClick={() => void handleDelete(blog.id, blog.title)}
                    aria-label={`Delete ${blog.title}`}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
