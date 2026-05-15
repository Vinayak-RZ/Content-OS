/** Pure numeric helpers for embeddings (OpenAI text-embedding-3-small, dim 1536). */

export function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/** Cosine similarity in [-1, 1] for equal-length vectors. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i += 1) {
    const ai = a[i]!;
    const bi = b[i]!;
    dot += ai * bi;
    na += ai * ai;
    nb += bi * bi;
  }
  const denom = Math.sqrt(na) * Math.sqrt(nb);
  return denom === 0 ? 0 : dot / denom;
}

/** Postgres `vector` / `::text` typically `[0.1,0.2,...]`. */
export function parsePgVectorText(raw: string | null | undefined): number[] | null {
  if (raw == null) return null;
  const t = raw.trim();
  if (t === "" || t.toLowerCase() === "null") return null;
  if (!t.startsWith("[") || !t.endsWith("]")) return null;
  const inner = t.slice(1, -1).trim();
  if (inner === "") return [];
  const parts = inner.split(",");
  const out: number[] = [];
  for (const p of parts) {
    const n = Number.parseFloat(p.trim());
    if (Number.isNaN(n)) return null;
    out.push(n);
  }
  return out;
}
