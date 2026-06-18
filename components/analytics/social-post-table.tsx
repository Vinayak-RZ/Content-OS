import Link from "next/link";

import type { BufferPostListItem } from "@/lib/analytics/buffer-summary";

function formatOptional(value: number | null): string {
  if (value == null) return "—";
  return value.toLocaleString();
}

export function SocialPostTable({ posts }: { posts: BufferPostListItem[] }) {
  if (posts.length === 0) {
    return (
      <p className="px-6 py-12 text-center text-sm text-muted-foreground sm:px-8">
        No sent posts found for your LinkedIn or X channels. Publish via Buffer
        or run a sync after posts go live.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[48rem] text-left text-sm">
        <thead className="border-b border-subtle bg-muted/20 text-xs uppercase tracking-wide text-muted-foreground">
          <tr>
            <th className="px-6 py-3 font-semibold sm:px-8">Post</th>
            <th className="px-3 py-3 font-semibold">Platform</th>
            <th className="px-3 py-3 font-semibold">Published</th>
            <th className="px-3 py-3 font-semibold text-right">Impressions</th>
            <th className="px-3 py-3 font-semibold text-right">Reactions</th>
            <th className="px-3 py-3 font-semibold text-right">Comments</th>
            <th className="px-3 py-3 font-semibold text-right">Reposts</th>
            <th className="px-6 py-3 font-semibold sm:px-8" />
          </tr>
        </thead>
        <tbody className="divide-y divide-subtle">
          {posts.map((post) => (
            <tr key={post.id} className="hover:bg-muted/10">
              <td className="max-w-xs px-6 py-4 sm:px-8">
                <p className="line-clamp-2 font-medium">{post.textPreview}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {post.channelName}
                </p>
              </td>
              <td className="px-3 py-4">{post.platform}</td>
              <td className="px-3 py-4 text-muted-foreground">
                {post.publishedAt
                  ? new Date(post.publishedAt).toLocaleDateString()
                  : "—"}
              </td>
              <td className="px-3 py-4 text-right tabular-nums">
                {formatOptional(post.impressions)}
              </td>
              <td className="px-3 py-4 text-right tabular-nums">
                {formatOptional(post.reactions)}
              </td>
              <td className="px-3 py-4 text-right tabular-nums">
                {formatOptional(post.comments)}
              </td>
              <td className="px-3 py-4 text-right tabular-nums">
                {formatOptional(post.reposts)}
              </td>
              <td className="px-6 py-4 text-right sm:px-8">
                <Link
                  href={`/analytics/posts/${post.id}`}
                  className="font-heading text-xs font-semibold text-brand hover:underline"
                >
                  Details
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
