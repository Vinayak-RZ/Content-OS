import type { PersonaType } from "@/lib/personas/types";
import { resolvePersonaLabel } from "@/lib/personas/types";

export type BuilderQuestionType = "short" | "long";

export type BuilderQuestion = {
  id: string;
  type: BuilderQuestionType;
  label: string;
  placeholder: string;
  personaOnly?: boolean;
};

/** Shared across all personas (6 questions). Plain language — easy to read, still room for depth in answers. */
export const KNOWLEDGE_BUILDER_BASE_QUESTIONS: BuilderQuestion[] = [
  {
    id: "nameRole",
    type: "short",
    label: "Who are you? What do you post about?",
    placeholder: "e.g. Founder · I write about startups and AI",
  },
  {
    id: "voice",
    type: "long",
    label: "What does your writing sound like?",
    placeholder:
      "e.g. Short sentences. Plain words. I explain things simply but I don't talk down to people.",
  },
  {
    id: "expertise",
    type: "long",
    label: "What topics do you know well?",
    placeholder:
      "e.g. Startups, coding, AI tools, side projects — anything you could talk about for an hour.",
  },
  {
    id: "opinions",
    type: "long",
    label: "What do you believe? (Strong takes are good.)",
    placeholder:
      "e.g. Most people overcomplicate X. Y is underrated. I'd never do Z this way.",
  },
  {
    id: "platform",
    type: "short",
    label: "How do you usually post on LinkedIn or X?",
    placeholder:
      "e.g. LinkedIn: 2–3 short paragraphs, hook first. X: one line, then a thread.",
  },
  {
    id: "banned",
    type: "short",
    label: "Words you'd never use in a post",
    placeholder: "e.g. synergy, game-changer, thrilled to announce",
  },
];

const PERSONA_QUESTION_PAIRS: Record<
  PersonaType,
  [BuilderQuestion, BuilderQuestion]
> = {
  founder: [
    {
      id: "personaFocus",
      type: "long",
      label: "What are you building? Who is it for?",
      placeholder:
        "e.g. A tool for freelancers. Early stage. Solo founders who hate invoicing.",
      personaOnly: true,
    },
    {
      id: "personaAngle",
      type: "long",
      label: "What have you learned from building that you'd post about?",
      placeholder:
        "e.g. Getting first users, pricing, mistakes, what worked and what didn't.",
      personaOnly: true,
    },
  ],
  engineer: [
    {
      id: "personaFocus",
      type: "short",
      label: "What do you work on day to day?",
      placeholder: "e.g. Backend, Python, cloud, AI apps",
      personaOnly: true,
    },
    {
      id: "personaAngle",
      type: "long",
      label: "What tech opinions would you argue for in a post?",
      placeholder:
        "e.g. Simple beats clever. Tests matter. This tool is overhyped.",
      personaOnly: true,
    },
  ],
  student: [
    {
      id: "personaFocus",
      type: "short",
      label: "What are you learning right now?",
      placeholder: "e.g. Machine learning, coding interviews, a side project",
      personaOnly: true,
    },
    {
      id: "personaAngle",
      type: "long",
      label: "What do you want people to know you for?",
      placeholder:
        "e.g. Learning in public, breaking into tech, sharing project updates.",
      personaOnly: true,
    },
  ],
  content_creator: [
    {
      id: "personaFocus",
      type: "long",
      label: "Who reads you, and why?",
      placeholder:
        "e.g. Junior devs who want career tips. I help them avoid common mistakes.",
      personaOnly: true,
    },
    {
      id: "personaAngle",
      type: "short",
      label: "What kind of posts work best for you?",
      placeholder: "e.g. Short threads, stories, hot takes, how-to lists",
      personaOnly: true,
    },
  ],
  finance: [
    {
      id: "personaFocus",
      type: "long",
      label: "What markets or topics do you follow?",
      placeholder: "e.g. US stocks, crypto, macro news, personal finance",
      personaOnly: true,
    },
    {
      id: "personaAngle",
      type: "long",
      label: "How do you think about money or markets?",
      placeholder:
        "e.g. Long-term over hype. Risk first. I don't chase every trend.",
      personaOnly: true,
    },
  ],
  other: [
    {
      id: "personaFocus",
      type: "long",
      label: "What makes your point of view different?",
      placeholder: "e.g. The mix of skills or life experience only you have.",
      personaOnly: true,
    },
    {
      id: "personaAngle",
      type: "long",
      label: "What topics are worth posting about for you?",
      placeholder: "e.g. Things you'd actually say yes to — not just scroll past.",
      personaOnly: true,
    },
  ],
};

/** @deprecated Use getBuilderQuestions */
export const KNOWLEDGE_BUILDER_QUESTIONS = [
  ...KNOWLEDGE_BUILDER_BASE_QUESTIONS,
  ...PERSONA_QUESTION_PAIRS.founder,
];

export type BuilderAnswerId =
  | (typeof KNOWLEDGE_BUILDER_BASE_QUESTIONS)[number]["id"]
  | "personaFocus"
  | "personaAngle";

export type BuilderAnswers = Partial<Record<BuilderAnswerId, string>>;

export function getBuilderQuestions(
  personaType: PersonaType | null | undefined,
  personaCustom?: string | null,
): BuilderQuestion[] {
  const persona = personaType ?? "other";
  const [q1, q2] = PERSONA_QUESTION_PAIRS[persona];

  if (persona === "other" && personaCustom?.trim()) {
    const label = resolvePersonaLabel(persona, personaCustom);
    return [
      ...KNOWLEDGE_BUILDER_BASE_QUESTIONS,
      {
        ...q1,
        label: `As a ${label}, what do you focus on?`,
      },
      q2,
    ];
  }

  return [...KNOWLEDGE_BUILDER_BASE_QUESTIONS, q1, q2];
}

export const ALL_BUILDER_ANSWER_IDS: BuilderAnswerId[] = [
  ...KNOWLEDGE_BUILDER_BASE_QUESTIONS.map((q) => q.id as BuilderAnswerId),
  "personaFocus",
  "personaAngle",
];

function line(value: string | undefined, fallback: string): string {
  const v = value?.trim();
  return v && v.length > 0 ? v : fallback;
}

function section(title: string, body: string): string {
  return `## ${title}\n\n${body}\n`;
}

function joinParts(...parts: (string | undefined)[]): string {
  return parts
    .map((p) => p?.trim())
    .filter(Boolean)
    .join("\n\n");
}

/** Map optional answers into the four system knowledge files. */
export function composeKnowledgeFilesFromAnswers(
  answers: BuilderAnswers,
): Record<
  "writing-style" | "soul" | "technical-interests" | "thoughts",
  string
> {
  const nameRole = answers.nameRole?.trim();
  const voice = answers.voice?.trim();
  const expertise = answers.expertise?.trim();
  const opinions = answers.opinions?.trim();
  const platform = answers.platform?.trim();
  const banned = answers.banned?.trim();
  const personaFocus = answers.personaFocus?.trim();
  const personaAngle = answers.personaAngle?.trim();

  const brandLine = joinParts(personaFocus, personaAngle);

  const writingStyle = [
    "# writing-style.md - Writing Style",
    "",
    "> Built from your in-app profile. Edit anytime.",
    "",
    section(
      "Who Is Writing",
      line(
        joinParts(nameRole, personaFocus),
        "[Add who you are and what your writing is for.]",
      ),
    ),
    section(
      "Core Voice",
      line(
        voice,
        "[Describe tone, rhythm, and 3–4 traits that define your voice.]",
      ),
    ),
    section(
      "Platform Notes",
      line(
        joinParts(platform, personaAngle),
        "### LinkedIn\n[Typical length, hook style, paragraph breaks]\n\n### X (Twitter)\n[Punchiness, threads vs single posts]",
      ),
    ),
    section(
      "Things That Are Banned",
      line(banned, "[Phrases and patterns that are not you.]"),
    ),
    section(
      "The Test",
      "Before publishing: Does this sound like something I'd actually say? Would I post this without cringing? Is there one clear idea?",
    ),
  ].join("\n");

  const soul = [
    "# soul.md - Who They Are",
    "",
    "> Built from your in-app profile. Edit anytime.",
    "",
    section(
      "The Person",
      line(joinParts(nameRole, personaFocus), "[Who you are at a glance.]"),
    ),
    section(
      "What Drives Them",
      line(brandLine, "[What you want your public voice to stand for.]"),
    ),
    section(
      "Personality Notes",
      line(voice, "[How you show up — humor, directness, warmth.]"),
    ),
  ].join("\n");

  const technicalInterests = [
    "# technical-interests.md - Interests & Expertise",
    "",
    "> Built from your in-app profile. Edit anytime.",
    "",
    section(
      "Primary Domains",
      line(joinParts(expertise, personaFocus), "[Domains you follow with real depth.]"),
    ),
    section(
      "Actual Opinions",
      line(joinParts(opinions, personaAngle), "[Where you disagree with the mainstream.]"),
    ),
    section(
      "Content Filter for Content OS",
      `Good topics: grounded in ${line(joinParts(expertise, personaFocus), "your domains")}, where you can add a real take.\n\nSkip: ${line(personaAngle, "generic trend spam, topics outside your expertise.")}`,
    ),
  ].join("\n");

  const thoughts = [
    "# thoughts.md - How They Think",
    "",
    "> Built from your in-app profile. Edit anytime.",
    "",
    section(
      "Strong Beliefs",
      line(joinParts(opinions, personaAngle), "[Beliefs you'd defend in public.]"),
    ),
    section(
      "Brand Position",
      line(brandLine, "[What you want to be known for over time.]"),
    ),
    section(
      "What to Avoid",
      line(personaAngle, "[Topics and angles that aren't worth your time.]"),
    ),
  ].join("\n");

  return {
    "writing-style": writingStyle,
    soul,
    "technical-interests": technicalInterests,
    thoughts,
  };
}

export function hasAnyBuilderAnswer(answers: BuilderAnswers): boolean {
  return ALL_BUILDER_ANSWER_IDS.some((id) => {
    const v = answers[id]?.trim();
    return Boolean(v && v.length > 0);
  });
}
