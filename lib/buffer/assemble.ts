export function assembleLinkedInPost(draft: {
  hookVariants: string[];
  ctaVariants: string[];
  selectedHook: number;
  selectedCta: number;
  currentContent: string;
}): string {
  const hook = draft.hookVariants[draft.selectedHook] ?? "";
  const cta = draft.ctaVariants[draft.selectedCta] ?? "";
  return `${hook}\n\n${draft.currentContent}\n\n${cta}`.trim();
}

export function buildTwitterThreadMetadata(parts: string[]): {
  text: string;
  metadata: { twitter: { thread: { text: string }[] } };
} {
  const thread = parts.map((text) => ({ text: text.trim() })).filter((p) => p.text);
  if (thread.length === 0) {
    throw new Error("X thread must have at least one tweet.");
  }
  return {
    text: thread[0]!.text,
    metadata: { twitter: { thread } },
  };
}
