export type FaqItem = {
  question: string;
  answer: string;
};

export const LANDING_FAQ: FaqItem[] = [
  {
    question: "What is Content OS?",
    answer:
      "Content OS is a free content workflow app for founders, engineers, and creators. It discovers trending topics from sources like Hacker News, Reddit, RSS, and GitHub, ranks them against your personal knowledge base, and helps you draft posts in your own voice.",
  },
  {
    question: "Is Content OS free to use?",
    answer:
      "Yes. The Content OS app is free forever with no subscription. You sign in with Google and optionally connect your own AI and discovery API keys when you want drafts or live topic discovery.",
  },
  {
    question: "Do I need my own API keys?",
    answer:
      "API keys are optional until you run discovery or generate drafts. Content OS uses your keys (stored encrypted) for embeddings, search, and generation. Most providers offer free tiers that cover regular personal use.",
  },
  {
    question: "Does Content OS auto-post to social media?",
    answer:
      "No. Content OS never auto-posts. You review, edit, and publish every word yourself. It amplifies your thinking and drafting — you keep full control of what goes live.",
  },
  {
    question: "Who is Content OS for?",
    answer:
      "Founders building in public, engineers sharing technical insights, content creators, students, and anyone who wants signal over noise — curated topics grounded in what you actually know and care about.",
  },
];
