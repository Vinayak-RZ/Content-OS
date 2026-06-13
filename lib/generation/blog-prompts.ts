import type { ChatMessage } from "@/lib/llm/chat";
import { targetWordCount } from "@/lib/blogs/read-time";
import type { BlogSourceText } from "@/lib/blogs/types";
import { getContentAngle } from "@/lib/personas/content-angles";
import { resolvePersonaLabel } from "@/lib/personas/types";
import type { RetrievedKnowledgeContext } from "@/lib/retrieval";

function formatSourceTexts(sources: BlogSourceText[]): string {
  if (sources.length === 0) return "(No source excerpts provided.)";
  return sources
    .slice(0, 8)
    .map(
      (s, i) =>
        `[${i + 1}] ${s.title}\nURL: ${s.url}\n${s.excerpt.slice(0, 2500)}`,
    )
    .join("\n\n---\n\n");
}

function buildBlogSystemBase(
  personaType: string | null | undefined,
  personaCustom: string | null | undefined,
): string {
  const audience = resolvePersonaLabel(personaType, personaCustom);
  const contentAngle = getContentAngle(personaType, personaCustom);

  return `You are writing a long-form blog post for ${audience}.

Match WRITING STYLE from the knowledge base — voice, rhythm, and honesty come from there.
This is a blog, not a LinkedIn post: tell the full story, let insight emerge from specifics.

Platform guidance for blogs:
- 600–1500+ words depending on target length
- Personal, conversational tone — reads like a person wrote it
- Real details, names, numbers, decisions — not abstracted
- No generic intro that restates the title
- No tidy summary conclusion that just repeats the post
- Humor and asides welcome when they fit the voice

Never use generic AI hype phrases or listicle templates.
Write in first person. Be specific. Include a real opinion.

${contentAngle}`;
}

export function buildBlogGenerationMessages(params: {
  retrieved: RetrievedKnowledgeContext;
  title: string;
  sourceTexts: BlogSourceText[];
  readTimeMinutes: number;
  personaType?: string | null;
  personaCustom?: string | null;
}): ChatMessage[] {
  const writing =
    params.retrieved.writingStyleBlock.trim().length > 0
      ? params.retrieved.writingStyleBlock
      : "(No writing-style.md chunks yet — use a personal, credible voice.)";

  const narrative =
    params.retrieved.founderContextBlock.trim().length > 0
      ? params.retrieved.founderContextBlock
      : "(No background/narrative chunks passed the similarity threshold.)";

  const domain =
    params.retrieved.technicalContextBlock.trim().length > 0
      ? params.retrieved.technicalContextBlock
      : "(No interests/expertise chunks passed the similarity threshold.)";

  const targetWords = targetWordCount(params.readTimeMinutes);
  const minWords = Math.round(targetWords * 0.85);
  const maxWords = Math.round(targetWords * 1.15);

  const systemContent = `${buildBlogSystemBase(params.personaType, params.personaCustom)}

Return ONLY the blog post body as plain markdown.
Do not wrap in JSON. Do not include a title heading — the title is provided separately.

WRITING STYLE:
${writing}`;

  const userContent = `BACKGROUND / NARRATIVE:
${narrative}

INTERESTS & EXPERTISE (use when relevant, do not force):
${domain}

BLOG TOPIC:
Title: ${params.title}
Target read time: ~${params.readTimeMinutes} minutes (${minWords}–${maxWords} words)

SOURCE MATERIAL (research excerpts — synthesize and react, do not plagiarize):
${formatSourceTexts(params.sourceTexts)}

TASK:
Write a complete blog post in markdown (## for sections, no top-level # title).
Aim for ${minWords}–${maxWords} words. Your genuine take — interpret, connect, and add opinion.
Use source material for facts and angles, but write in your own voice throughout.`;

  return [
    { role: "system", content: systemContent.slice(0, 32000) },
    { role: "user", content: userContent.slice(0, 32000) },
  ];
}
