import type { PersonaType } from "@/lib/personas/types";

const BASE_BAR = `Bar: you should be able to add insight, not just summarize. No listicles, no generic hype.
Tone from writing-style.md - match their natural voice. First person when drafting social posts.`;

export const PERSONA_CONTENT_ANGLES: Record<
  Exclude<PersonaType, "other">,
  string
> = {
  student: `Audience: students and early-career builders sharing what they're learning.

Good post material (examples, not limits):
- A paper, tutorial, or blog they can explain in their own words with a takeaway.
- Projects, internships, hackathons, or research with a honest lesson.
- Career, learning systems, or tools that changed how they work.
- Industry news they can connect to where they're headed - not hot takes for clout.

${BASE_BAR}`,

  founder: `Audience: founders and operators building in public.

Good post material (examples, not limits):
- News, launches, or essays they can react to with a builder's lens.
- Product, distribution, hiring, fundraising - when grounded in specifics.
- Technical or market shifts tied to a lesson from building, not hype.
- Contrarian or lived takes from actually shipping.

${BASE_BAR}`,

  engineer: `Audience: engineers and technical practitioners.

Good post material (examples, not limits):
- Infra, systems, dev tools, AI engineering, architecture - with real detail.
- Postmortems, tradeoffs, and "what we'd do differently" stories.
- Open source, benchmarks, or deep dives they can add context to.
- Industry moves when tied to how things actually work under the hood.

${BASE_BAR}`,

  content_creator: `Audience: creators growing an audience across LinkedIn, X, and similar platforms.

Good post material (examples, not limits):
- Stories, frameworks, or behind-the-scenes from their niche.
- Reactions to trends in their space with a personal angle.
- Actionable insights from experiments (what worked, what didn't).
- Topics their audience already cares about - depth over virality hacks.

${BASE_BAR}`,

  finance: `Audience: people in finance, investing, and markets who write with conviction.

Good post material (examples, not limits):
- Market moves, earnings, macro, or policy - with a clear thesis.
- Fintech, banking, or industry shifts explained for their audience.
- Risk, valuation, or behavioral angles grounded in experience.
- News they can interpret - not recap headlines without a view.

${BASE_BAR}`,
};

export function getContentAngle(
  personaType: string | null | undefined,
  personaCustom?: string | null,
): string {
  if (
    personaType &&
    personaType !== "other" &&
    personaType in PERSONA_CONTENT_ANGLES
  ) {
    return PERSONA_CONTENT_ANGLES[personaType as Exclude<PersonaType, "other">];
  }

  const custom = personaCustom?.trim();
  if (custom) {
    return `Audience: ${custom}.

Good post material:
- Topics where this person has genuine depth, experience, or a clear opinion.
- News and ideas they can interpret for their audience - not generic summaries.
- Stories and lessons from their actual work or interests.

${BASE_BAR}`;
  }

  return `Audience: founders, creators, and professionals building a public voice online.

Good post material (examples, not limits):
- Substantive news, essays, or ideas they can react to with a genuine take.
- Topics aligned with their knowledge files - depth over breadth.
- Personal stories and opinions that sound like them, not a press release.

${BASE_BAR}`;
}
