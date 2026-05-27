/** User persona - drives discovery queries, draft angles, and profile prompt tone. */
export const PERSONA_TYPES = [
  "student",
  "founder",
  "engineer",
  "content_creator",
  "finance",
  "other",
] as const;

export type PersonaType = (typeof PERSONA_TYPES)[number];

export const PERSONA_LABELS: Record<PersonaType, string> = {
  student: "Student",
  founder: "Founder",
  engineer: "Engineer",
  content_creator: "Content creator",
  finance: "Finance & markets",
  other: "Other",
};

export const PERSONA_DESCRIPTIONS: Record<Exclude<PersonaType, "other">, string> = {
  student:
    "Learning, career growth, research, and ideas worth sharing while you build your path.",
  founder:
    "Building a company - product, distribution, fundraising, and lessons from the trenches.",
  engineer:
    "Systems, code, architecture, tools, and technical takes grounded in how things work.",
  content_creator:
    "Audience, storytelling, platforms, and turning ideas into posts people actually read.",
  finance:
    "Markets, investing, macro, fintech, and analysis with a clear point of view.",
};

export function isPersonaType(value: string): value is PersonaType {
  return (PERSONA_TYPES as readonly string[]).includes(value);
}

export function resolvePersonaLabel(
  personaType: string | null | undefined,
  personaCustom?: string | null,
): string {
  if (personaType && isPersonaType(personaType) && personaType !== "other") {
    return PERSONA_LABELS[personaType];
  }
  if (personaCustom?.trim()) {
    return personaCustom.trim();
  }
  return "Creator";
}
