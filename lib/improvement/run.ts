import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { syncBufferForUser } from "@/lib/buffer/sync";
import { requireBufferCredentials } from "@/lib/buffer/credentials";
import {
  applyCutoffAttribution,
  attributeSocialPosts,
  boostAppPublishedAttribution,
} from "@/lib/improvement/attribution";
import { generateAndWriteInsightFiles } from "@/lib/improvement/insights";
import { researchLinkedInTrends } from "@/lib/improvement/linkedin-research";
import { analyzePerformance } from "@/lib/improvement/performance";
import { generateProposals } from "@/lib/improvement/proposals";
import type {
  ImprovementRunSummary,
  ImprovementStep,
} from "@/lib/improvement/types";

async function updateRunStep(runId: string, step: ImprovementStep): Promise<void> {
  await prisma.improvementRun.update({
    where: { id: runId },
    data: { step },
  });
}

export async function runImprovementForUser(
  userId: string,
): Promise<{ runId: string; summary: ImprovementRunSummary }> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const run = await prisma.improvementRun.create({
    data: { userId, status: "running", step: "sync" },
  });

  try {
    await updateRunStep(run.id, "sync");
    try {
      requireBufferCredentials(user);
      await syncBufferForUser(user);
    } catch {
      /* Buffer not connected — continue with existing data */
    }

    await updateRunStep(run.id, "attribute");
    await boostAppPublishedAttribution(userId);
    await attributeSocialPosts(userId);
    await applyCutoffAttribution(userId);

    await updateRunStep(run.id, "analyze");
    const analysis = await analyzePerformance(userId);

    await updateRunStep(run.id, "research");
    const linkedinResearch = await researchLinkedInTrends({
      tavilyApiKey: user.tavilyApiKey,
      personaType: user.personaType,
      personaCustom: user.personaCustom,
    });

    await updateRunStep(run.id, "insights");
    const insightFilesUpdated = await generateAndWriteInsightFiles({
      userId,
      runId: run.id,
      analysis,
      research: linkedinResearch,
    });

    await updateRunStep(run.id, "proposals");
    const proposalsCreated = await generateProposals({
      userId,
      runId: run.id,
      analysis,
    });

    const summary: ImprovementRunSummary = {
      analysis,
      linkedinResearch,
      insightFilesUpdated,
      proposalsCreated,
      stats: {
        postsAnalyzed: analysis.stats.postsAnalyzed,
        postsAttributed: analysis.stats.postsAttributed,
        postsUnattributed: analysis.stats.postsUnattributed,
        postsFromContentOs: analysis.stats.postsFromContentOs,
      },
    };

    await prisma.improvementRun.update({
      where: { id: run.id },
      data: {
        status: "completed",
        step: null,
        completedAt: new Date(),
        summary: summary as unknown as Prisma.InputJsonValue,
      },
    });

    return { runId: run.id, summary };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Improvement run failed";
    await prisma.improvementRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        completedAt: new Date(),
        error: message.slice(0, 500),
      },
    });
    throw err;
  }
}

export async function getLatestImprovementRun(userId: string) {
  return prisma.improvementRun.findFirst({
    where: { userId },
    orderBy: { startedAt: "desc" },
  });
}

export async function listImprovementRuns(userId: string, limit = 20) {
  return prisma.improvementRun.findMany({
    where: { userId },
    orderBy: { startedAt: "desc" },
    take: limit,
    select: {
      id: true,
      status: true,
      step: true,
      startedAt: true,
      completedAt: true,
      summary: true,
      error: true,
    },
  });
}

export async function getImprovementRun(userId: string, runId: string) {
  return prisma.improvementRun.findFirst({
    where: { id: runId, userId },
    include: {
      proposals: {
        orderBy: { createdAt: "asc" },
      },
    },
  });
}
