import type { ChatMessage } from "@/lib/llm/chat";
import type { RetrievedKnowledgeContext } from "@/lib/retrieval";

const GENERATION_SYSTEM_BASE = `You are generating a LinkedIn post for a technical founder.
Match FOUNDER WRITING STYLE exactly.
Never use generic AI phrases. Never use listicle formats.
Write in first person. Be specific. Be technically credible.
Return ONLY valid JSON with keys: post, hooks (array of exactly 3 strings), ctas (array of 2-3 strings), imageIdea (string).`;

export function buildGenerationMessages(params: {
  retrieved: RetrievedKnowledgeContext;
  topicTitle: string;
  topicSummary: string;
  sources: string[];
}): ChatMessage[] {
  const writing =
    params.retrieved.writingStyleBlock.trim().length > 0
      ? params.retrieved.writingStyleBlock
      : "(No writing-style.md chunks yet — use a concise, credible founder voice.)";

  const founder =
    params.retrieved.founderContextBlock.trim().length > 0
      ? params.retrieved.founderContextBlock
      : "(No founder narrative chunks passed the similarity threshold.)";

  const technical =
    params.retrieved.technicalContextBlock.trim().length > 0
      ? params.retrieved.technicalContextBlock
      : "(No technical chunks passed the similarity threshold.)";

  const sourcesLine =
    params.sources.length > 0
      ? params.sources.slice(0, 6).join("\n")
      : "(none)";

  const systemContent = `${GENERATION_SYSTEM_BASE}

FOUNDER WRITING STYLE:
${writing}`;

  const userContent = `FOUNDER CONTEXT:
${founder}

TECHNICAL CONTEXT:
${technical}

TREND CONTEXT:
Topic: ${params.topicTitle}
Summary: ${params.topicSummary}
Sources:
${sourcesLine}

TASK:
Generate a LinkedIn post about this topic.
Target length: 900-1500 characters for the post body.
Also generate exactly 3 hook variants and 2-3 CTA variants.
Return JSON: { "post", "hooks", "ctas", "imageIdea" }`;

  return [
    { role: "system", content: systemContent.slice(0, 32000) },
    { role: "user", content: userContent.slice(0, 32000) },
  ];
}

export const EDIT_COMMAND_INSTRUCTIONS: Record<string, string> = {
  shorten:
    "Reduce by ~30%. Remove redundancy. Preserve core argument, technical specifics, and founder voice. Do not change hook or CTA.",
  rewrite:
    "Rewrite entirely. Same topic, same context, different approach. Keep technical credibility and first-person voice.",
  strongerHook:
    "Replace only the first sentence with a more attention-grabbing opening. Return the full post with only the first sentence changed.",
  moreTechnical:
    "Increase technical depth and specificity. Add concrete details, specific tool names, or precise mechanisms.",
  lessDramatic:
    "Remove hyperbole, superlatives, and dramatic language. Make tone more measured and analytical.",
  founderFraming:
    "Reframe from the perspective of someone actively building a startup. Add builder insights.",
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

  const systemContent = `You edit LinkedIn posts for a technical founder.
Match FOUNDER WRITING STYLE.
Return only the edited post text. No explanation. No JSON.

FOUNDER WRITING STYLE:
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
