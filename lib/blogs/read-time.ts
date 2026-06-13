/** Average adult reading speed for long-form prose (words per minute). */
export const WORDS_PER_MINUTE = 200;

export function targetWordCount(readTimeMinutes: number): number {
  return Math.max(300, Math.round(readTimeMinutes * WORDS_PER_MINUTE));
}

export function estimateReadTimeMinutes(wordCount: number): number {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE));
}

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

export const READ_TIME_OPTIONS = [3, 5, 8, 12, 20, 30] as const;

export type ReadTimeOption = (typeof READ_TIME_OPTIONS)[number];
