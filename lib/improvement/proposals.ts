import { prisma } from "@/lib/db";
import { extractJsonObject } from "@/lib/generation/draft-schema";
import { draftChatComplete } from "@/lib/llm/chat";
import { requireDraftProviderAuth } from "@/lib/llm/draft-provider";
import {
  DEFAULT_SIGNALS_WEIGHTS,
  DEFAULT_STUDIO_WEIGHTS,
  getRankingWeights,
  SIGNALS_WEIGHT_LABELS,
  STUDIO_WEIGHT_LABELS,
} from "@/lib/improvement/weights";
import { getUserRankingWeights } from "@/lib/improvement/ranking-weights";
import type {
  PerformanceAnalysis,
  ProposalSummary,
  UserRankingWeights,
} from "@/lib/improvement/types";

type ProposalGenerationResult = {
  styleRationale: string;
  styleProposedContent: string;
  rankingRationale: string;
  rankingProposedSignals: Record<string, number>;
  rankingProposedStudio: Record<string, number>;
};

function buildProposalMessages(
  analysis: PerformanceAnalysis,
  currentStyle: string,
  currentWeights: UserRankingWeights | null,
): { role: "system" | "user"; content: string }[] {
  const signalsCurrent = getRankingWeights("signals", currentWeights);
  const studioCurrent = getRankingWeights("studio", currentWeights);

  return [
    {
      role: "system",
      content: `You propose improvements based on post performance data.
Return ONLY valid JSON with keys:
- styleRationale (string)
- styleProposedContent (full revised writing-style.md markdown)
- rankingRationale (string)
- rankingProposedSignals (object with keys: technical, momentum, founder, original, writing — must sum to ~1)
- rankingProposedStudio (object with keys: studio, founder, brand, writing, original, momentum, technical — must sum to ~1)
Be conservative — small shifts only. Tie rationale to specific performance patterns.`,
    },
    {
      role: "user",
      content: `PERFORMANCE ANALYSIS:
What's working: ${analysis.whatsWorking.map((b) => b.text).join("; ") || "none"}
What's not: ${analysis.whatsNotWorking.map((b) => b.text).join("; ") || "none"}
Top post: ${analysis.topPerformers[0]?.textPreview ?? "none"}

CURRENT WRITING STYLE:
${currentStyle.slice(0, 4000)}

CURRENT SIGNALS WEIGHTS:
${JSON.stringify(signalsCurrent)}

CURRENT STUDIO WEIGHTS:
${JSON.stringify(studioCurrent)}

Propose targeted improvements.`,
    },
  ];
}

function parseProposalResponse(
  raw: string,
  currentStyle: string,
): ProposalGenerationResult {
  const parsed = extractJsonObject(raw) as Partial<ProposalGenerationResult>;
  return {
    styleRationale:
      typeof parsed.styleRationale === "string"
        ? parsed.styleRationale
        : "Based on your top-performing posts, consider emphasizing personal stories and specific lessons.",
    styleProposedContent:
      typeof parsed.styleProposedContent === "string"
        ? parsed.styleProposedContent
        : currentStyle,
    rankingRationale:
      typeof parsed.rankingRationale === "string"
        ? parsed.rankingRationale
        : "Shift weights toward content types that performed best.",
    rankingProposedSignals: {
      ...DEFAULT_SIGNALS_WEIGHTS,
      ...(parsed.rankingProposedSignals ?? {}),
    },
    rankingProposedStudio: {
      ...DEFAULT_STUDIO_WEIGHTS,
      ...(parsed.rankingProposedStudio ?? {}),
    },
  };
}

export async function generateProposals(params: {
  userId: string;
  runId: string;
  analysis: PerformanceAnalysis;
}): Promise<ProposalSummary[]> {
  const { userId, runId, analysis } = params;

  if (!analysis.sufficientData) {
    return [];
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const styleFile = await prisma.knowledgeFile.findFirst({
    where: { userId, role: "style" },
    orderBy: { sortOrder: "asc" },
  });
  const currentStyle = styleFile?.content ?? "";
  const currentWeights = await getUserRankingWeights(userId);

  let result: ProposalGenerationResult;
  try {
    const { provider, apiKey } = requireDraftProviderAuth(user);
    const raw = await draftChatComplete({
      provider,
      apiKey,
      messages: buildProposalMessages(analysis, currentStyle, currentWeights),
      temperature: 0.4,
      maxTokens: 4096,
      jsonObject: true,
    });
    result = parseProposalResponse(raw, currentStyle);
  } catch {
    return [];
  }

  const signalsCurrent = getRankingWeights("signals", currentWeights);
  const studioCurrent = getRankingWeights("studio", currentWeights);

  const proposals: ProposalSummary[] = [];

  if (result.styleProposedContent.trim() !== currentStyle.trim()) {
    const styleProposal = await prisma.improvementProposal.create({
      data: {
        userId,
        runId,
        type: "style_edit",
        target: styleFile?.slug ?? "writing-style",
        title: "Update writing style based on performance",
        rationale: result.styleRationale,
        currentValue: { content: currentStyle },
        proposedValue: { content: result.styleProposedContent },
        status: "pending",
      },
    });
    proposals.push({
      id: styleProposal.id,
      type: "style_edit",
      title: styleProposal.title,
    });
  }

  const rankingProposal = await prisma.improvementProposal.create({
    data: {
      userId,
      runId,
      type: "ranking_weights",
      target: "ranking_weights",
      title: "Adjust discovery ranking weights",
      rationale: result.rankingRationale,
      currentValue: {
        signals: signalsCurrent,
        studio: studioCurrent,
        labels: { signals: SIGNALS_WEIGHT_LABELS, studio: STUDIO_WEIGHT_LABELS },
      },
      proposedValue: {
        signals: result.rankingProposedSignals,
        studio: result.rankingProposedStudio,
      },
      status: "pending",
    },
  });
  proposals.push({
    id: rankingProposal.id,
    type: "ranking_weights",
    title: rankingProposal.title,
  });

  return proposals;
}

export async function applyProposal(
  userId: string,
  proposalId: string,
): Promise<void> {
  const proposal = await prisma.improvementProposal.findFirst({
    where: { id: proposalId, userId, status: "pending" },
  });
  if (!proposal) {
    throw new Error("Proposal not found or already decided");
  }

  if (proposal.type === "style_edit") {
    const proposed = proposal.proposedValue as { content?: string };
    const content = proposed.content ?? "";
    const slug = proposal.target;
    const { syncKnowledgeFile } = await import("@/lib/knowledge/sync");
    await syncKnowledgeFile(userId, slug, content);
  } else if (proposal.type === "ranking_weights") {
    const proposed = proposal.proposedValue as {
      signals?: Record<string, number>;
      studio?: Record<string, number>;
    };
    const { applyRankingWeights } = await import(
      "@/lib/improvement/ranking-weights"
    );
    await applyRankingWeights(userId, {
      signals: proposed.signals,
      studio: proposed.studio,
    });
  }

  await prisma.improvementProposal.update({
    where: { id: proposalId },
    data: { status: "applied", decidedAt: new Date() },
  });
}

export async function rejectProposal(
  userId: string,
  proposalId: string,
): Promise<void> {
  const updated = await prisma.improvementProposal.updateMany({
    where: { id: proposalId, userId, status: "pending" },
    data: { status: "rejected", decidedAt: new Date() },
  });
  if (updated.count === 0) {
    throw new Error("Proposal not found or already decided");
  }
}

export async function listProposals(
  userId: string,
  status?: string,
) {
  return prisma.improvementProposal.findMany({
    where: {
      userId,
      ...(status ? { status } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}
