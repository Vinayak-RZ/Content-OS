/** ~512 tokens prose ≈ this many chars for English-ish text */
const TARGET_CHUNK_CHARS = 2_000;
const MIN_CHUNK_CHARS = 200;

/**
 * Paragraph-first chunking with light overlap between adjacent chunks for retrieval continuity.
 */
export function splitKnowledgeIntoChunks(markdown: string): string[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  const blocks = trimmed.split(/\n{2,}/);
  const chunks: string[] = [];
  let current = "";

  function flush(force: boolean) {
    const c = current.trim();
    if (!c) {
      current = "";
      return;
    }
    if (force || c.length >= TARGET_CHUNK_CHARS) {
      chunks.push(c);
      current = "";
    }
  }

  for (const block of blocks) {
    const piece = block.trim();
    if (!piece) continue;

    if (
      piece.length >= TARGET_CHUNK_CHARS &&
      !(current.trim().length > MIN_CHUNK_CHARS)
    ) {
      flush(true);
      for (let i = 0; i < piece.length; i += TARGET_CHUNK_CHARS) {
        chunks.push(piece.slice(i, i + TARGET_CHUNK_CHARS).trim());
      }
      continue;
    }

    const nextLen = current.length + piece.length + 2;
    if (nextLen > TARGET_CHUNK_CHARS && current.trim().length >= MIN_CHUNK_CHARS) {
      flush(true);
    }
    current = current ? `${current}\n\n${piece}` : piece;
    if (current.length >= TARGET_CHUNK_CHARS) {
      flush(true);
    }
  }
  flush(true);

  const filtered = chunks.map((t) => t.trim()).filter(Boolean);
  return filtered.length > 0 ? filtered : [trimmed.slice(0, TARGET_CHUNK_CHARS * 4)];
}
