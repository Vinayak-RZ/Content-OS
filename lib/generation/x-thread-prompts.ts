import type { ChatMessage } from "@/lib/llm/chat";
import { resolvePersonaLabel } from "@/lib/personas/types";

export const X_THREAD_MAX_CHARS = 250;
export const X_THREAD_MIN_PARTS = 2;
export const X_THREAD_MAX_PARTS = 3;
export const X_THREAD_HASHTAG_COUNT = 4;

export function buildXThreadMessages(params: {
  linkedInPost: string;
  topicTitle: string;
  retrievedWritingStyle: string;
  personaType?: string | null;
  personaCustom?: string | null;
}): ChatMessage[] {
  const audience = resolvePersonaLabel(params.personaType, params.personaCustom);
  const writing = params.retrievedWritingStyle.trim().length
    ? params.retrievedWritingStyle
    : "(style unavailable)";

  const systemContent = `You repurpose LinkedIn posts into X (Twitter) threads for ${audience}.

X voice rules:
- Punchier, more conversational, slightly spicier than LinkedIn
- Short sentences. No corporate filler.
- First tweet hooks hard — opinion or tension, not a bland intro
- Each tweet must stand alone but flow as a thread
- Tweet 1 MUST end with exactly ${X_THREAD_HASHTAG_COUNT} relevant hashtags (space-separated, each starting with #)
- Tweets 2+ must NOT include hashtags unless one is essential inline
- Every tweet MUST be under ${X_THREAD_MAX_CHARS} characters (count carefully)
- Produce ${X_THREAD_MIN_PARTS} to ${X_THREAD_MAX_PARTS} tweets total
- Do NOT copy LinkedIn wording verbatim — reframe for X

Return ONLY valid JSON: { "tweets": ["tweet1", "tweet2", ...] }

WRITING STYLE (adapt for X, do not copy LinkedIn tone):
${writing}`;

  const userContent = `TOPIC: ${params.topicTitle}

LINKEDIN POST (source — repurpose, do not duplicate):
${params.linkedInPost.slice(0, 12000)}

TASK:
Write a ${X_THREAD_MIN_PARTS}–${X_THREAD_MAX_PARTS} tweet X thread based on this LinkedIn post.
Tweet 1: hook + core take + ${X_THREAD_HASHTAG_COUNT} hashtags at the end.
Each tweet < ${X_THREAD_MAX_CHARS} chars.
Return JSON: { "tweets": [...] }`;

  return [
    { role: "system", content: systemContent.slice(0, 32000) },
    { role: "user", content: userContent.slice(0, 32000) },
  ];
}

export function validateXThreadTweets(raw: string[]): string[] {
  const trimmed = raw
    .map((t) => t.trim())
    .filter((t) => t.length > 0)
    .slice(0, X_THREAD_MAX_PARTS);

  if (trimmed.length < X_THREAD_MIN_PARTS) {
    throw new Error(`Expected at least ${X_THREAD_MIN_PARTS} tweets`);
  }

  for (const tweet of trimmed) {
    if (tweet.length > X_THREAD_MAX_CHARS) {
      throw new Error(
        `Tweet exceeds ${X_THREAD_MAX_CHARS} characters (${tweet.length})`,
      );
    }
  }

  return trimmed;
}
