export type FaqItem = {
  question: string;
  answer: string;
};

import {
  GUEST_MODE_FAQ_DIFF,
  GUEST_MODE_FAQ_TRY,
} from "@/lib/seo/guest-mode";

export const LANDING_FAQ: FaqItem[] = [
  {
    question: "What is Content OS?",
    answer:
      "Content OS is a free content workflow app for founders, engineers, and creators. It discovers trending topics from sources like Hacker News, Instagram, Reddit, RSS, and GitHub, ranks them against your personal knowledge base, and helps you draft posts in your own voice.",
  },
  {
    question: "Is Content OS free to use?",
    answer:
      "Yes. The Content OS app is free forever with no subscription. Try as a guest with no account, or sign in with Google and optionally connect your own AI and discovery API keys when you want drafts or live topic discovery.",
  },
  GUEST_MODE_FAQ_TRY,
  GUEST_MODE_FAQ_DIFF,
  {
    question: "Do I need my own API keys?",
    answer:
      "API keys are optional until you run discovery or generate drafts. Content OS uses your keys (stored encrypted) for embeddings, search, and generation. Most providers offer free tiers that cover regular personal use.",
  },
  {
    question: "Does Content OS auto-post to social media?",
    answer:
      "No. Content OS never auto-posts. You review, edit, and publish every word yourself. It amplifies your thinking and drafting - you keep full control of what goes live.",
  },
  {
    question: "Can Content OS help me build a personal brand?",
    answer:
      "Yes. Content OS is built for people who want a consistent public voice - founders, engineers, creators, and operators. It ranks topics against what you actually know, drafts in your writing style, and keeps you in the loop so every post still sounds like you. Over time, that makes publishing regularly much easier without diluting your brand.",
  },
  {
    question: "Who is Content OS for?",
    answer:
      "Founders building in public, engineers sharing technical insights, content creators, students, and anyone who wants signal over noise - curated topics grounded in what you actually know and care about.",
  },
  {
    question: "How does topic ranking work?",
    answer:
      "After discovery pulls candidates from your enabled sources, Content OS scores each topic against your knowledge base using embeddings and relevance signals. Higher scores mean the topic aligns with what you have written about and care about — so you draft on ideas you can speak to with authority, not random trends.",
  },
  {
    question: "What AI providers work with Content OS?",
    answer:
      "Content OS is BYOK (bring your own keys). You can connect providers such as OpenRouter and OpenAI for generation, plus Tavily and Firecrawl for search and enrichment when you run discovery or drafts. Keys are stored encrypted; nothing is required until you choose to run those features.",
  },
  {
    question: "Is my data safe in Content OS?",
    answer:
      "Sign-in uses Google OAuth. API keys are encrypted at rest. Guest mode keeps topics in your browser session only — nothing is written to the server until you sign in. Content OS does not auto-post; drafts and knowledge stay under your control.",
  },
  {
    question: "How is Content OS different from Buffer or Notion AI?",
    answer:
      "Buffer focuses on scheduling posts you already wrote. Notion AI helps inside documents. Content OS sits upstream: it discovers high-signal topics from the open web, ranks them against your knowledge base, and drafts in your voice — with no auto-posting and a free app where you bring your own API keys.",
  },
];
