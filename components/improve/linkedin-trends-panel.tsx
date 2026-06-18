"use client";

import type { LinkedInResearchResult } from "@/lib/improvement/types";
import { ExternalLink } from "lucide-react";

export function LinkedInTrendsPanel({
  research,
}: {
  research: LinkedInResearchResult | null;
}) {
  if (!research) {
    return (
      <p className="text-sm text-muted-foreground">
        Run an improvement cycle to fetch LinkedIn trend research.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">{research.synthesis}</p>
      {research.sources.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {research.sources.map((source) => (
            <li
              key={source.url}
              className="rounded-lg border border-subtle bg-muted/10 p-4"
            >
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-2 font-heading text-sm font-semibold hover:text-brand"
              >
                <span className="line-clamp-2 flex-1">{source.title}</span>
                <ExternalLink className="size-3.5 shrink-0 opacity-60 group-hover:opacity-100" />
              </a>
              <p className="mt-2 line-clamp-3 text-xs text-muted-foreground">
                {source.snippet}
              </p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          No sources found. Add a Tavily API key in Settings.
        </p>
      )}
    </div>
  );
}
