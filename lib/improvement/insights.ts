import { prisma } from "@/lib/db";
import { extractJsonObject } from "@/lib/generation/draft-schema";
import { draftChatComplete } from "@/lib/llm/chat";
import { requireDraftProviderAuth } from "@/lib/llm/draft-provider";
import { upsertAgentInsightFile } from "@/lib/knowledge/agent-insight";
import type {
  InsightFileUpdate,
  LinkedInResearchResult,
  PerformanceAnalysis,
} from "@/lib/improvement/types";

type InsightGenerationResult = {
  performancePlaybook: string;
  linkedinTrends: string;
  contentPatterns: string;
};

function buildInsightMessages(
  analysis: PerformanceAnalysis,
  research: LinkedInResearchResult,
): { role: "system" | "user"; content: string }[] {
  const workingLines = analysis.whatsWorking
    .map((b) => `- ${b.text}`)
    .join("\n");
  const notWorkingLines = analysis.whatsNotWorking
    .map((b) => `- ${b.text}`)
    .join("\n");
  const domainLines = analysis.breakdowns.domains
    .slice(0, 8)
    .map(
      (d) =>
        `- ${d.label}: ${d.count} posts, ${d.avgEngagementRate.toFixed(1)}% avg engagement`,
    )
    .join("\n");
  const topPosts = analysis.topPerformers
    .map(
      (p) =>
        `- [${p.contentDomainLabel}] "${p.textPreview}" (${p.engagementRate?.toFixed(1) ?? "?"}% eng, ${p.platform})`,
    )
    .join("\n");
  const researchSources = research.sources
    .map((s) => `- ${s.title}: ${s.snippet.slice(0, 120)}`)
    .join("\n");

  return [
    {
      role: "system",
      content: `You synthesize post performance data into concise markdown insight documents.
Return ONLY valid JSON with keys: performancePlaybook, linkedinTrends, contentPatterns.
Each value is markdown (use ## headings, bullet lists). Be specific and actionable. No fluff.

CRITICAL RULES:
- Analyze ALL synced Buffer posts (Content OS + external), not only Content OS drafts.
- Frame every insight at the CONTENT DOMAIN level (e.g. "Startup insights", "Entrepreneurship", "Founder journey", "Technical / engineering").
- NEVER cite specific topic titles, trend names, or granular tags (e.g. do NOT say "value proposition posts" — say "Startup insights" or "Entrepreneurship content").
- Prefer domain-level patterns over individual post summaries.`,
    },
    {
      role: "user",
      content: `PERFORMANCE STATS (all Buffer posts):
- Posts analyzed: ${analysis.stats.postsAnalyzed} (${analysis.stats.postsFromContentOs} from Content OS, ${analysis.stats.postsExternal} external)
- Avg impressions: ${Math.round(analysis.stats.avgImpressions)}
- Avg engagement rate: ${analysis.stats.avgEngagementRate.toFixed(2)}%

CONTENT DOMAIN BREAKDOWN:
${domainLines || "(insufficient data)"}

WHAT'S WORKING (domain-level):
${workingLines || "(insufficient data)"}

WHAT'S NOT WORKING (domain-level):
${notWorkingLines || "(insufficient data)"}

TOP POSTS (with domain):
${topPosts || "(none)"}

LINKEDIN TREND RESEARCH:
${research.synthesis}

SOURCES:
${researchSources || "(none)"}

Write three insight documents using DOMAIN language only:
1. performancePlaybook — which content domains work best for this creator (startup insights, entrepreneurship, etc.)
2. linkedinTrends — what's working on LinkedIn now for their niche, framed by domain
3. contentPatterns — format/length/domain patterns from their full post history`,
    },
  ];
}

function parseInsightResponse(raw: string): InsightGenerationResult {
  const parsed = extractJsonObject(raw) as Partial<InsightGenerationResult>;
  return {
    performancePlaybook:
      typeof parsed.performancePlaybook === "string"
        ? parsed.performancePlaybook
        : "# Performance playbook\n\nInsufficient data to generate insights yet.",
    linkedinTrends:
      typeof parsed.linkedinTrends === "string"
        ? parsed.linkedinTrends
        : "# LinkedIn trends\n\nConnect Tavily and run again.",
    contentPatterns:
      typeof parsed.contentPatterns === "string"
        ? parsed.contentPatterns
        : "# Content patterns\n\nPublish more posts to detect patterns.",
  };
}

export async function generateAndWriteInsightFiles(params: {
  userId: string;
  runId: string;
  analysis: PerformanceAnalysis;
  research: LinkedInResearchResult;
}): Promise<InsightFileUpdate[]> {
  const { userId, runId, analysis, research } = params;
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  let insights: InsightGenerationResult;

  try {
    const { provider, apiKey } = requireDraftProviderAuth(user);
    const raw = await draftChatComplete({
      provider,
      apiKey,
      messages: buildInsightMessages(analysis, research),
      temperature: 0.5,
      maxTokens: 4096,
      jsonObject: true,
    });
    insights = parseInsightResponse(raw);
  } catch {
    insights = {
      performancePlaybook: `# Performance playbook\n\n${analysis.whatsWorking.map((b) => `- ${b.text}`).join("\n") || "Publish and sync more posts."}`,
      linkedinTrends: `# LinkedIn trends\n\n${research.synthesis}\n\n${research.sources.map((s) => `- [${s.title}](${s.url})`).join("\n")}`,
      contentPatterns: `# Content patterns\n\nAnalyzed ${analysis.stats.postsAnalyzed} posts. Avg engagement: ${analysis.stats.avgEngagementRate.toFixed(2)}%.`,
    };
  }

  const updates: InsightFileUpdate[] = [];

  const files = [
    { slug: "performance-playbook", content: insights.performancePlaybook },
    { slug: "linkedin-trends", content: insights.linkedinTrends },
    { slug: "content-patterns", content: insights.contentPatterns },
  ] as const;

  for (const file of files) {
    const updated = await upsertAgentInsightFile(
      userId,
      file.slug,
      file.content,
      runId,
    );
    updates.push({
      slug: file.slug,
      fileName: updated.fileName,
      fileVersion: updated.fileVersion,
    });
  }

  return updates;
}
