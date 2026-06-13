"use client";

import Link from "next/link";
import {
  BookOpen,
  Clock,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SerializedBlogSummary } from "@/lib/blogs/types";
import { cn } from "@/lib/utils";

export function RecentBlogsPanel({
  blogs,
  className,
}: {
  blogs: SerializedBlogSummary[];
  className?: string;
}) {
  return (
    <Card className={cn("border-border/80 shadow-pill", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="size-4 text-brand" />
          Recently logged blogs
        </CardTitle>
        <CardDescription>
          Your latest long-form drafts from this board.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {blogs.length === 0 ? (
          <p className="rounded-lg border border-dashed border-subtle bg-muted/20 px-3 py-4 text-sm text-muted-foreground">
            No blogs yet. Compose one above — research sources, pick a read
            time, and generate in your voice.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {blogs.map((blog) => (
              <li key={blog.id}>
                <Link
                  href={`/blog/${blog.id}`}
                  className="group flex flex-col gap-1 rounded-lg border border-subtle bg-muted/10 px-3 py-2.5 transition-colors hover:border-brand/30 hover:bg-brand/5"
                >
                  <span className="line-clamp-2 font-medium text-sm text-foreground group-hover:text-brand">
                    {blog.title}
                  </span>
                  <span className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <Clock className="size-3" />
                      {blog.estimatedReadMinutes > 0
                        ? `${blog.estimatedReadMinutes} min read`
                        : `Target ${blog.readTimeMinutes} min`}
                    </span>
                    <span>·</span>
                    <span>
                      {new Date(blog.createdAt).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>
                    {blog.status === "published" ? (
                      <>
                        <span>·</span>
                        <Badge variant="muted" className="h-5 px-1.5 text-[10px] normal-case">
                          Published
                        </Badge>
                      </>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
