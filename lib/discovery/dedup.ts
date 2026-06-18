import { prisma } from "@/lib/db";
import type { TrendCandidate } from "@/lib/discovery/types";
import type { ContentPipeline } from "@/lib/pipelines/types";
import { canonicalizeUrl, urlSha256 } from "@/lib/discovery/urls";

const SELECT_MEMORY_DAYS = 14;

/** Topic memory URLs to never surface again (published, or recently selected). */
export async function collectMemoryExcludedUrlHashes(
  userId: string,
): Promise<Set<string>> {
  const out = new Set<string>();

  const published = await prisma.topicEngagement.findMany({
    where: { userId, status: "published", urlHash: { not: null } },
    select: { urlHash: true },
  });
  for (const r of published) {
    if (r.urlHash) out.add(r.urlHash);
  }

  const since = new Date(Date.now() - SELECT_MEMORY_DAYS * 864e5);
  const selected = await prisma.topicEngagement.findMany({
    where: {
      userId,
      status: "selected",
      selectedAt: { gte: since },
      urlHash: { not: null },
    },
    select: { urlHash: true },
  });
  for (const r of selected) {
    if (r.urlHash) out.add(r.urlHash);
  }

  return out;
}

export async function collectExistingTrendUrlHashes(
  userId: string,
  pipeline?: ContentPipeline,
): Promise<Set<string>> {
  const rows = await prisma.trend.findMany({
    where: {
      userId,
      ...(pipeline ? { pipeline } : {}),
    },
    select: { urlHash: true },
  });
  return new Set(rows.map((r) => r.urlHash));
}

export type DedupStats = {
  kept: TrendCandidate[];
  memorySkipped: number;
  duplicateSkipped: number;
};

export function dedupNewCandidates(
  candidates: TrendCandidate[],
  existingUrlHashes: Set<string>,
  memoryExcludedHashes: Set<string>,
): DedupStats {
  let memorySkipped = 0;
  let duplicateSkipped = 0;
  const seenInBatch = new Set<string>();
  const kept: TrendCandidate[] = [];

  for (const c of candidates) {
    const canon = canonicalizeUrl(c.url);
    const hash = urlSha256(canon);
    if (memoryExcludedHashes.has(hash)) {
      memorySkipped += 1;
      continue;
    }
    if (existingUrlHashes.has(hash)) {
      duplicateSkipped += 1;
      continue;
    }
    if (seenInBatch.has(hash)) {
      duplicateSkipped += 1;
      continue;
    }
    seenInBatch.add(hash);
    kept.push({ ...c, url: canon });
  }

  return { kept, memorySkipped, duplicateSkipped };
}
