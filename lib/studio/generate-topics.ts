import { randomUUID } from "crypto";

import { prisma } from "@/lib/db";
import {
  computeFetchBudget,
  getSavedTrendsForDiscovery,
  POOL_TARGET,
} from "@/lib/discovery/carry-over";
import {
  collectExistingTrendUrlHashes,
  collectMemoryExcludedUrlHashes,
  dedupNewCandidates,
} from "@/lib/discovery/dedup";
import type { DiscoveryRunResult } from "@/lib/discovery/orchestrator";
import { trimVisibleTopicPool } from "@/lib/discovery/pool-trim";
import type { TrendCandidate } from "@/lib/discovery/types";
import { urlSha256 } from "@/lib/discovery/urls";
import { DISCOVERY_NEW_PER_RUN } from "@/lib/discovery/founder-profile";
import { extractJsonObject } from "@/lib/generation/draft-schema";
import { draftChatComplete } from "@/lib/llm/chat";
import { requireDraftProviderAuth } from "@/lib/llm/draft-provider";
import { userHasStudioKnowledge } from "@/lib/knowledge/studio-ready";
import { rankDiscoveryPool } from "@/lib/ranking";
import { retrieveKnowledgeContext } from "@/lib/retrieval";
import {
  studioTopicsResponseSchema,
  type StudioTopicIdea,
} from "@/lib/studio/schema";
import { studioTopicUrl } from "@/lib/studio/urls";

import { TOPIC_POOL_EXPIRES_MS } from "@/lib/discovery/topic-pool-ttl";

const CATEGORY_TAGS: Record<StudioTopicIdea["category"], string> = {
  founder_journey: "journey",
  startup_update: "startup",
  icp_value: "icp",
  lesson_learned: "lesson",
  behind_the_scenes: "bts",
};

function ideaToCandidate(userId: string, idea: StudioTopicIdea): TrendCandidate {
  const url = studioTopicUrl(userId, idea.title);
  return {
    title: idea.title,
    url,
    summary: `${idea.summary}\n\nAngle: ${idea.angle}\nHook idea: ${idea.suggestedHook}`,
    source: "Studio",
    sourceType: "studio",
    tags: ["studio", CATEGORY_TAGS[idea.category], idea.category],
    trendScore: 0.85,
    discoveredAt: new Date(),
    metadata: {
      studioCategory: idea.category,
      suggestedHook: idea.suggestedHook,
      angle: idea.angle,
    },
  };
}

function buildStudioIdeationMessages(
  retrieved: Awaited<ReturnType<typeof retrieveKnowledgeContext>>,
): { role: "system" | "user"; content: string }[] {
  const narrative = retrieved.founderContextBlock.trim() ||
    "(No narrative knowledge yet — infer cautiously from other context.)";
  const brand = narrative;
  const technical = retrieved.technicalContextBlock.trim() || "(none)";
  const writing = retrieved.writingStyleBlock.trim() || "(concise founder voice)";

  return [
    {
      role: "system",
      content: `You ideate personal-brand content topics for a founder. Return ONLY valid JSON: { "topics": [ ... ] }.
Each topic needs: title, summary (2-3 sentences), angle (how to frame it), suggestedHook (opening line), category (one of: founder_journey, startup_update, icp_value, lesson_learned, behind_the_scenes).
Generate 8-12 distinct ideas grounded in the user's knowledge — not generic motivational fluff.
Do NOT summarize news articles. These are stories about the user's journey, startup, ICP, and lessons.`,
    },
    {
      role: "user",
      content: `WRITING STYLE:
${writing}

NARRATIVE / JOURNEY:
${narrative}

BRAND / ICP:
${brand}

EXPERTISE (optional angles):
${technical}

Generate 8-12 story ideas the founder could post on LinkedIn/X about themselves.`,
    },
  ];
}

export async function runStudioTopicGeneration(
  userId: string,
): Promise<DiscoveryRunResult> {
  const batchId = randomUUID();
  const hasKnowledge = await userHasStudioKnowledge(userId);
  if (!hasKnowledge) {
    throw new Error(
      "Add Knowledge about your journey and brand first (narrative + brand files).",
    );
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const { provider, apiKey } = requireDraftProviderAuth(user);

  const retrieved = await retrieveKnowledgeContext(
    userId,
    "founder journey startup ICP personal brand",
    "story ideas about my startup journey, ICP pains, and lessons learned",
  );

  let raw: string;
  try {
    raw = await draftChatComplete({
      provider,
      apiKey,
      messages: buildStudioIdeationMessages(retrieved),
      jsonObject: true,
      temperature: 0.75,
      maxTokens: 4096,
    });
  } catch {
    raw = await draftChatComplete({
      provider,
      apiKey,
      messages: buildStudioIdeationMessages(retrieved),
      jsonObject: false,
      temperature: 0.75,
      maxTokens: 4096,
    });
  }

  const parsed = studioTopicsResponseSchema.safeParse(extractJsonObject(raw));
  if (!parsed.success) {
    throw new Error("Studio ideation returned invalid topics. Try again.");
  }

  const saved = await getSavedTrendsForDiscovery(userId, "studio");
  computeFetchBudget(saved.length);

  const sourceCounts: Record<string, number> = {
    carriedOver: saved.length,
    studio: parsed.data.topics.length,
    newFetched: 0,
    duplicateSkipped: 0,
    memorySkipped: 0,
  };

  const candidates = parsed.data.topics.map((idea) =>
    ideaToCandidate(userId, idea),
  );

  const [existingHashes, memoryHashes] = await Promise.all([
    collectExistingTrendUrlHashes(userId, "studio"),
    collectMemoryExcludedUrlHashes(userId),
  ]);

  const deduped = dedupNewCandidates(candidates, existingHashes, memoryHashes);
  sourceCounts.newFetched = deduped.kept.length;
  sourceCounts.memorySkipped = deduped.memorySkipped;
  sourceCounts.duplicateSkipped = deduped.duplicateSkipped;

  const expiresAt = new Date(Date.now() + TOPIC_POOL_EXPIRES_MS);
  const finalScores = await rankDiscoveryPool(
    userId,
    saved,
    deduped.kept,
    "studio",
  );

  const newScoreSlice = finalScores.slice(saved.length);
  const rankedNew = deduped.kept
    .map((c, i) => ({
      c,
      score:
        typeof newScoreSlice[i] === "number"
          ? newScoreSlice[i]!
          : c.trendScore,
    }))
    .sort((a, b) => b.score - a.score);

  const newSlots = DISCOVERY_NEW_PER_RUN;
  const toStore = rankedNew.slice(0, newSlots).map((r) => r.c);
  const runTopics: DiscoveryRunResult["topics"] = [];

  await prisma.$transaction(
    async (tx) => {
      for (let i = 0; i < saved.length; i += 1) {
        const s = saved[i];
        const fs = finalScores[i];
        if (!s) continue;
        const score = typeof fs === "number" ? fs : s.trendScore;
        await tx.trend.update({
          where: { id: s.id },
          data: {
            discoveryBatchId: batchId,
            expiresAt,
            finalScore: score,
          },
        });
        runTopics.push({
          trendId: s.id,
          topicTitle: s.title,
          finalScore: score,
          source: s.source,
          role: "carried",
        });
      }

      for (let j = 0; j < rankedNew.length && j < newSlots; j += 1) {
        const row = rankedNew[j];
        if (!row) continue;
        const c = row.c;
        const fs = row.score;
        const created = await tx.trend.create({
          data: {
            userId,
            title: c.title.slice(0, 240),
            source: c.source.slice(0, 120),
            url: c.url,
            urlHash: urlSha256(c.url),
            summary: c.summary.slice(0, 2400),
            trendScore: c.trendScore,
            finalScore: typeof fs === "number" ? fs : c.trendScore,
            tags: c.tags.slice(0, 20),
            sourceType: c.sourceType,
            pipeline: "studio",
            discoveredAt: c.discoveredAt,
            expiresAt,
            discoveryBatchId: batchId,
          },
        });
        runTopics.push({
          trendId: created.id,
          topicTitle: created.title,
          finalScore: created.finalScore,
          source: created.source,
          role: "new",
        });
      }
    },
    { maxWait: 15_000, timeout: 120_000 },
  );

  sourceCounts.poolTarget = POOL_TARGET;
  sourceCounts.newPerRun = DISCOVERY_NEW_PER_RUN;
  sourceCounts.storedNew = toStore.length;

  const trimmed = await trimVisibleTopicPool(userId, "studio");
  sourceCounts.poolTrimmed = trimmed;

  return {
    userId,
    batchId,
    pipeline: "studio",
    carriedOver: saved.length,
    newStored: toStore.length,
    sourceCounts,
    topics: runTopics.sort((a, b) => b.finalScore - a.finalScore),
  };
}

/** Single custom Studio topic from free-text prompt. */
export async function createStudioCustomTopic(
  userId: string,
  prompt: string,
): Promise<{ trendId: string }> {
  const trimmed = prompt.trim();
  if (trimmed.length < 8) {
    throw new Error("Prompt too short.");
  }

  const title = trimmed.slice(0, 240);
  const url = studioTopicUrl(userId, title);
  const hash = urlSha256(url);

  const existing = await prisma.trend.findFirst({
    where: { userId, pipeline: "studio", urlHash: hash },
    select: { id: true },
  });
  if (existing) {
    return { trendId: existing.id };
  }

  const expiresAt = new Date(Date.now() + TOPIC_POOL_EXPIRES_MS);
  const created = await prisma.trend.create({
    data: {
      userId,
      title,
      source: "Studio",
      url,
      urlHash: hash,
      summary: trimmed.slice(0, 2400),
      trendScore: 0.9,
      finalScore: 0.9,
      tags: ["studio", "custom"],
      sourceType: "studio",
      pipeline: "studio",
      expiresAt,
    },
  });

  return { trendId: created.id };
}
