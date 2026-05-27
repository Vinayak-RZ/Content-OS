import type { ChatMessage } from "@/lib/llm/chat";
import { getContentAngle } from "@/lib/personas/content-angles";
import { resolvePersonaLabel } from "@/lib/personas/types";
import type { RetrievedKnowledgeContext } from "@/lib/retrieval";

function buildGenerationSystemBase(
  personaType: string | null | undefined,
  personaCustom: string | null | undefined,
): string {
  const audience = resolvePersonaLabel(personaType, personaCustom);
  const contentAngle = getContentAngle(personaType, personaCustom);

  return `You are generating a social post (LinkedIn / X style) for ${audience}.

Match WRITING STYLE from the knowledge base — that defines voice, not the topic list.
Topics can be anything substantive where this person has a credible take.

Never use generic AI hype phrases. Never use listicle formats.
Write in first person. Be specific. Add a real opinion or lesson.

${contentAngle}

Return ONLY valid JSON with keys: post, hooks (array of exactly 3 strings), ctas (array of 2-3 strings), imageIdea (string).`;
}

export function buildGenerationMessages(params: {
  retrieved: RetrievedKnowledgeContext;
  topicTitle: string;
  topicSummary: string;
  sources: string[];
  personaType?: string | null;
  personaCustom?: string | null;
}): ChatMessage[] {
  const writing =
    params.retrieved.writingStyleBlock.trim().length > 0
      ? params.retrieved.writingStyleBlock
      : "(No writing-style.md chunks yet — use a concise, credible voice.)";

  const narrative =
    params.retrieved.founderContextBlock.trim().length > 0
      ? params.retrieved.founderContextBlock
      : "(No background/narrative chunks passed the similarity threshold.)";

  const domain =
    params.retrieved.technicalContextBlock.trim().length > 0
      ? params.retrieved.technicalContextBlock
      : "(No interests/expertise chunks passed the similarity threshold.)";

  const sourcesLine =
    params.sources.length > 0
      ? params.sources.slice(0, 6).join("\n")
      : "(none)";

  const systemContent = `${buildGenerationSystemBase(params.personaType, params.personaCustom)}

WRITING STYLE:
${writing}`;

  const userContent = `BACKGROUND / NARRATIVE:
${narrative}

INTERESTS & EXPERTISE (use when relevant, do not force):
${domain}

TREND CONTEXT:
Topic: ${params.topicTitle}
Summary: ${params.topicSummary}
Sources:
${sourcesLine}

TASK:
Write a social post with your genuine take on this topic — react, interpret, or connect to your work, not just summarize.
Target length: 900-1500 characters for the post body.
Also generate exactly 3 hook variants and 2-3 CTA variants.
Return JSON: { "post", "hooks", "ctas", "imageIdea" }`;

  return [
    { role: "system", content: systemContent.slice(0, 32000) },
    { role: "user", content: userContent.slice(0, 32000) },
  ];
}

export const EDIT_COMMAND_INSTRUCTIONS: Record<string, string> = {
  shortenLight:
    "Tighten the post slightly: remove roughly 50–80 words of filler and redundancy. Keep every key argument and example. Preserve voice and structure.",
  shorten100:
    "Shorten by approximately 100 words. Cut repetition and secondary asides; keep the core thesis, best evidence, and voice intact.",
  shortenHeavy:
    "Shorten substantially — remove roughly 300–400 words (or cut to ~40% of current length if shorter). Keep only the strongest points. Be aggressive but preserve the main take and credibility.",
  shorten:
    "Reduce by ~30%. Remove redundancy. Preserve core argument and voice.",
  rewrite:
    "Rewrite entirely. Same topic, same context, different approach. Keep credibility and first-person voice.",
  strongerHook:
    "Replace only the first sentence with a more attention-grabbing opening. Return the full post with only the first sentence changed.",
  moreTechnical:
    "Increase depth and specificity. Add concrete details, names, or precise mechanisms where appropriate.",
  lessDramatic:
    "Remove hyperbole, superlatives, and dramatic language. Make tone more measured and analytical.",
  founderFraming:
    "Reframe from a personal builder/operator perspective. Add lived insight from doing the work.",
  clearerExplanation:
    "Find the most complex paragraph. Rewrite it to be clearer without losing accuracy.",
  addAnalogy:
    "Insert a clear, relevant analogy that illustrates the core concept naturally.",
  improveEnding:
    "Rewrite the final paragraph for a stronger close and more specific CTA.",
};

export function buildEditMessages(params: {
  retrievedWritingStyle: string;
  currentDraft: string;
  command: string;
  customInstruction?: string;
  personaType?: string | null;
  personaCustom?: string | null;
}): ChatMessage[] {
  const instr =
    params.command === "custom"
      ? (params.customInstruction ?? "").trim()
      : EDIT_COMMAND_INSTRUCTIONS[params.command] ??
        (params.customInstruction ?? "").trim();

  if (!instr) {
    throw new Error("Missing edit instruction");
  }

  const writing = params.retrievedWritingStyle.trim().length
    ? params.retrievedWritingStyle
    : "(style unavailable)";

  const audience = resolvePersonaLabel(params.personaType, params.personaCustom);

  const systemContent = `You edit social posts for ${audience}.
Match WRITING STYLE.
Return only the edited post text. No explanation. No JSON.

WRITING STYLE:
${writing}`;

  const userContent = `CURRENT DRAFT:
${params.currentDraft}

EDITING INSTRUCTION:
${instr}`;

  return [
    { role: "system", content: systemContent.slice(0, 32000) },
    { role: "user", content: userContent.slice(0, 32000) },
  ];
}
