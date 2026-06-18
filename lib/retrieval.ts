import type { KnowledgeRole } from "@/lib/knowledge/constants";
import { prisma } from "@/lib/db";
import { embedTexts } from "@/lib/knowledge/embed";
import { getKnowledgeRoleMap } from "@/lib/knowledge/roles-map";

const SIM_THRESHOLD = 0.72;
const STUDIO_SIM_THRESHOLD = 0.65;
const TOP_K_SCAN = 20;
const TOP_AFTER_FILTER = 8;
/** Rough char budget (~8k tokens × 4 chars, minus prompts). */
const MAX_FOUNDER_CHARS = 12000;
const MAX_TECH_CHARS = 14000;
const MAX_STUDIO_CHARS = 16000;

const MAX_INSIGHTS_CHARS = 6000;

export type RetrievedKnowledgeContext = {
  writingStyleBlock: string;
  founderContextBlock: string;
  technicalContextBlock: string;
  /** Studio-role docs — journey, ICP, platform context (full inject when forStudio). */
  studioContextBlock: string;
  /** Agent-written performance insights — injected into drafts when available. */
  performanceInsightsBlock: string;
};

export type RetrieveKnowledgeOptions = {
  /** When true, always inject all Studio-role files and prioritize studio chunks. */
  forStudio?: boolean;
};

function mergeChunks(
  chunks: { fileName: string; chunkText: string }[],
  maxChars: number,
): string {
  let used = 0;
  const parts: string[] = [];
  for (const c of chunks) {
    const header = `[${c.fileName}]\n`;
    const room = maxChars - used - header.length - 4;
    if (room < 80) break;
    const body =
      c.chunkText.length > room ? `${c.chunkText.slice(0, room)}…` : c.chunkText;
    parts.push(`${header}${body}`);
    used += header.length + body.length + 2;
    if (used >= maxChars) break;
  }
  return parts.join("\n\n");
}

function roleForHit(
  fileName: string,
  roleByFileName: Map<string, KnowledgeRole>,
): KnowledgeRole {
  return roleByFileName.get(fileName) ?? "general";
}

async function loadFullStudioBlock(
  userId: string,
  studioFileNames: string[],
): Promise<string> {
  if (studioFileNames.length === 0) return "";
  const chunks = await prisma.knowledgeChunk.findMany({
    where: { userId, fileName: { in: studioFileNames } },
    orderBy: [{ fileName: "asc" }, { chunkIndex: "asc" }],
    select: { fileName: true, chunkText: true },
  });
  return mergeChunks(chunks, MAX_STUDIO_CHARS);
}

async function loadInsightsBlock(userId: string): Promise<string> {
  const files = await prisma.knowledgeFile.findMany({
    where: { userId, role: "insights", isAgentManaged: true },
    orderBy: [{ sortOrder: "asc" }, { fileName: "asc" }],
    select: { fileName: true, content: true },
  });
  if (files.length === 0) return "";
  const parts = files.map((f) => `[${f.fileName}]\n${f.content}`);
  const combined = parts.join("\n\n");
  return combined.length > MAX_INSIGHTS_CHARS
    ? `${combined.slice(0, MAX_INSIGHTS_CHARS)}…`
    : combined;
}

/**
 * pgvector cosine retrieval: top 20, filter sim > 0.72, cap 8;
 * always inject all style-role files; bucket others by document role.
 * Studio mode always injects all studio-role files (like writing style).
 */
export async function retrieveKnowledgeContext(
  userId: string,
  topicTitle: string,
  topicSummary: string,
  options: RetrieveKnowledgeOptions = {},
): Promise<RetrievedKnowledgeContext> {
  const forStudio = options.forStudio === true;
  const { roleByFileName, styleFileNames, studioFileNames } =
    await getKnowledgeRoleMap(userId);

  const empty: RetrievedKnowledgeContext = {
    writingStyleBlock: "",
    founderContextBlock: "",
    technicalContextBlock: "",
    studioContextBlock: "",
    performanceInsightsBlock: "",
  };

  const performanceInsightsBlock = await loadInsightsBlock(userId);

  const topicText = `${topicTitle}\n\n${topicSummary}`.slice(0, 8000);
  const [topicEmb] = await embedTexts([topicText]);

  let writingStyleBlock = "";
  if (styleFileNames.length > 0) {
    const wsChunks = await prisma.knowledgeChunk.findMany({
      where: { userId, fileName: { in: styleFileNames } },
      orderBy: [{ fileName: "asc" }, { chunkIndex: "asc" }],
      select: { chunkText: true },
    });
    writingStyleBlock = wsChunks.map((c) => c.chunkText).join("\n\n");
  }

  const studioContextBlock = forStudio
    ? await loadFullStudioBlock(userId, studioFileNames)
    : "";

  if (!topicEmb || topicEmb.length !== 1536) {
    return { ...empty, writingStyleBlock, studioContextBlock, performanceInsightsBlock };
  }

  const vectorLiteral = `[${topicEmb.join(",")}]`;
  const styleSet = new Set(styleFileNames);
  const studioSet = new Set(studioFileNames);

  type RawHit = { fileName: string; chunkText: string; sim: number };
  const hits = await prisma.$queryRawUnsafe<RawHit[]>(
    `SELECT "fileName", "chunkText",
      (1 - (embedding <=> $1::vector))::float AS sim
     FROM "KnowledgeChunk"
     WHERE "userId" = $2 AND embedding IS NOT NULL
     ORDER BY embedding <=> $1::vector
     LIMIT ${TOP_K_SCAN}`,
    vectorLiteral,
    userId,
  );

  const simThreshold = forStudio ? STUDIO_SIM_THRESHOLD : SIM_THRESHOLD;

  const filtered = hits
    .map((h) => ({
      ...h,
      sim: typeof h.sim === "number" ? h.sim : Number(h.sim),
    }))
    .filter((h) => {
      if (styleSet.has(h.fileName) || studioSet.has(h.fileName)) return false;
      return !Number.isNaN(h.sim) && h.sim > simThreshold;
    })
    .sort((a, b) => b.sim - a.sim)
    .slice(0, TOP_AFTER_FILTER);

  const founder: { fileName: string; chunkText: string }[] = [];
  const technical: { fileName: string; chunkText: string }[] = [];
  const studioHits: { fileName: string; chunkText: string }[] = [];

  for (const h of filtered) {
    const role = roleForHit(h.fileName, roleByFileName);
    if (role === "studio") {
      studioHits.push({ fileName: h.fileName, chunkText: h.chunkText });
    } else if (role === "narrative" || role === "brand") {
      founder.push({ fileName: h.fileName, chunkText: h.chunkText });
    } else {
      technical.push({ fileName: h.fileName, chunkText: h.chunkText });
    }
  }

  const founderContextBlock =
    founder.length > 0 ? mergeChunks(founder, MAX_FOUNDER_CHARS) : "";

  const technicalContextBlock =
    technical.length > 0 ? mergeChunks(technical, MAX_TECH_CHARS) : "";

  const studioFromHits =
    !forStudio && studioHits.length > 0
      ? mergeChunks(studioHits, MAX_STUDIO_CHARS)
      : "";

  return {
    writingStyleBlock,
    founderContextBlock,
    technicalContextBlock,
    studioContextBlock: forStudio
      ? studioContextBlock
      : studioFromHits || studioContextBlock,
    performanceInsightsBlock,
  };
}

/** Lightweight style-only fetch for edit passes. */
export async function fetchWritingStyleText(userId: string): Promise<string> {
  const { styleFileNames } = await getKnowledgeRoleMap(userId);
  if (styleFileNames.length === 0) {
    const legacy = await prisma.knowledgeChunk.findMany({
      where: { userId, fileName: "writing-style.md" },
      orderBy: { chunkIndex: "asc" },
      select: { chunkText: true },
    });
    return legacy.map((c) => c.chunkText).join("\n\n");
  }
  const wsChunks = await prisma.knowledgeChunk.findMany({
    where: { userId, fileName: { in: styleFileNames } },
    orderBy: [{ fileName: "asc" }, { chunkIndex: "asc" }],
    select: { chunkText: true },
  });
  return wsChunks.map((c) => c.chunkText).join("\n\n");
}
