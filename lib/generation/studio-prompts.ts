import type { ChatMessage } from "@/lib/llm/chat";
import { getContentAngle } from "@/lib/personas/content-angles";
import { resolvePersonaLabel } from "@/lib/personas/types";
import type { RetrievedKnowledgeContext } from "@/lib/retrieval";
import {
  ADD_MORE_HASHTAG_COUNT,
  DEFAULT_POST_HASHTAG_COUNT,
  defaultHashtagInstruction,
} from "@/lib/generation/prompts";

function studioSystemBase(
  personaType: string | null | undefined,
  personaCustom: string | null | undefined,
): string {
  const audience = resolvePersonaLabel(personaType, personaCustom);
  const contentAngle = getContentAngle(personaType, personaCustom);

  return `You write first-person founder content for ${audience} on LinkedIn / X.

This is NOT a news reaction or article summary. Write about the founder's journey, startup, ICP pains, lessons, or behind-the-scenes builder stories.
Pull voice from WRITING STYLE. Pull facts and angles from NARRATIVE, JOURNEY, and BRAND context — do not invent credentials.

Never use generic AI hype. No listicles. Be specific and credible.

${contentAngle}`;
}

export function buildStudioGenerationMessages(params: {
  retrieved: RetrievedKnowledgeContext;
  topicTitle: string;
  topicSummary: string;
  personaType?: string | null;
  personaCustom?: string | null;
}): ChatMessage[] {
  const writing =
    params.retrieved.writingStyleBlock.trim() ||
    "(No writing-style yet — concise, credible founder voice.)";
  const narrative =
    params.retrieved.founderContextBlock.trim() ||
    "(No narrative/brand chunks passed similarity threshold.)";
  const domain =
    params.retrieved.technicalContextBlock.trim() ||
    "(No expertise chunks — optional.)";

  const systemContent = `${studioSystemBase(params.personaType, params.personaCustom)}

Return ONLY valid JSON: { "post", "hooks" (3 strings), "ctas" (2-3 strings), "imageIdea" (string) }.

WRITING STYLE:
${writing}`;

  const userContent = `YOUR STORY / NARRATIVE / BRAND:
${narrative}

EXPERTISE (use when it strengthens the story):
${domain}

STORY IDEA:
Title: ${params.topicTitle}
Notes: ${params.topicSummary}

TASK:
Write a personal post in first person — journey story, startup update, ICP value, or builder lesson.
Target 900-1500 characters for the post body.
${defaultHashtagInstruction(DEFAULT_POST_HASHTAG_COUNT)}`;

  return [
    { role: "system", content: systemContent.slice(0, 32000) },
    { role: "user", content: userContent.slice(0, 32000) },
  ];
}

export function buildStudioGenerationBodyMessages(params: {
  retrieved: RetrievedKnowledgeContext;
  topicTitle: string;
  topicSummary: string;
  personaType?: string | null;
  personaCustom?: string | null;
}): ChatMessage[] {
  const writing =
    params.retrieved.writingStyleBlock.trim() ||
    "(No writing-style yet — concise, credible founder voice.)";
  const narrative =
    params.retrieved.founderContextBlock.trim() ||
    "(No narrative/brand chunks passed similarity threshold.)";
  const domain =
    params.retrieved.technicalContextBlock.trim() ||
    "(No expertise chunks — optional.)";

  const systemContent = `${studioSystemBase(params.personaType, params.personaCustom)}

Return ONLY the post body text. No JSON. No hooks.

WRITING STYLE:
${writing}`;

  const userContent = `YOUR STORY / NARRATIVE / BRAND:
${narrative}

EXPERTISE:
${domain}

STORY IDEA:
Title: ${params.topicTitle}
Notes: ${params.topicSummary}

TASK:
Write a personal first-person post — not a news summary.
Target 900-1500 characters.
${defaultHashtagInstruction(DEFAULT_POST_HASHTAG_COUNT)}`;

  return [
    { role: "system", content: systemContent.slice(0, 32000) },
    { role: "user", content: userContent.slice(0, 32000) },
  ];
}

export { ADD_MORE_HASHTAG_COUNT, DEFAULT_POST_HASHTAG_COUNT };
