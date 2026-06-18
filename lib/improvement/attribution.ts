import { prisma } from "@/lib/db";

export type AttributionResult = {
  matched: number;
  skipped: number;
};

/** Normalize text for similarity comparison. */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/https?:\/\/\S+/g, "")
    .replace(/#\w+/g, "")
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Word-set Jaccard similarity. */
function jaccardSimilarity(a: string, b: string): number {
  const wordsA = new Set(a.split(" ").filter((w) => w.length > 2));
  const wordsB = new Set(b.split(" ").filter((w) => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;

  let intersection = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) intersection += 1;
  });
  const union = wordsA.size + wordsB.size - intersection;
  return union > 0 ? intersection / union : 0;
}

/** Prefix overlap for near-exact matches (Buffer may truncate). */
function prefixOverlap(a: string, b: string): number {
  const shorter = a.length <= b.length ? a : b;
  const longer = a.length <= b.length ? b : a;
  if (shorter.length < 40) return 0;
  if (longer.startsWith(shorter.slice(0, Math.min(shorter.length, 200)))) {
    return shorter.length / longer.length;
  }
  return 0;
}

function computeSimilarity(postText: string, draftContent: string): number {
  const normPost = normalizeText(postText);
  const normDraft = normalizeText(draftContent);
  if (!normPost || !normDraft) return 0;

  const prefix = prefixOverlap(normPost, normDraft);
  const jaccard = jaccardSimilarity(normPost, normDraft);
  return Math.max(prefix, jaccard);
}

const MATCH_THRESHOLD = 0.55;
const HIGH_CONFIDENCE = 0.85;

/**
 * Best-effort match Buffer-synced posts to drafts by text similarity.
 */
export async function attributeSocialPosts(userId: string): Promise<AttributionResult> {
  const unattributed = await prisma.socialPost.findMany({
    where: {
      userId,
      draftId: null,
      status: "sent",
    },
    select: { id: true, text: true },
  });

  if (unattributed.length === 0) {
    return { matched: 0, skipped: 0 };
  }

  const drafts = await prisma.draft.findMany({
    where: { userId },
    select: { id: true, currentContent: true },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  let matched = 0;
  let skipped = 0;

  for (const post of unattributed) {
    let bestDraftId: string | null = null;
    let bestScore = 0;

    for (const draft of drafts) {
      const score = computeSimilarity(post.text, draft.currentContent);
      if (score > bestScore) {
        bestScore = score;
        bestDraftId = draft.id;
      }
    }

    if (bestDraftId && bestScore >= MATCH_THRESHOLD) {
      const confidence = Math.min(1, bestScore);
      await prisma.socialPost.update({
        where: { id: post.id },
        data: {
          draftId: bestDraftId,
          attributionConfidence: confidence,
          attributionMethod:
            confidence >= HIGH_CONFIDENCE ? "text_match_high" : "text_match",
        },
      });
      matched += 1;
    } else {
      skipped += 1;
    }
  }

  return { matched, skipped };
}

/** Mark app-published posts with full attribution confidence. */
export async function boostAppPublishedAttribution(userId: string): Promise<void> {
  await prisma.socialPost.updateMany({
    where: {
      userId,
      draftId: { not: null },
      attributionConfidence: null,
    },
    data: {
      attributionConfidence: 1,
      attributionMethod: "app_publish",
    },
  });
}
