/** @deprecated Use `lib/knowledge/slug.ts` */
export {
  parseKnowledgeSlug as parseKnowledgeFileName,
  parseKnowledgeSlugOrFileName,
  slugToFileName,
  fileNameToSlug,
} from "@/lib/knowledge/slug";

import {
  parseKnowledgeSlug,
  parseKnowledgeSlugOrFileName,
} from "@/lib/knowledge/slug";

export function isAllowedKnowledgeFile(slugOrFile: string): boolean {
  return (
    parseKnowledgeSlug(slugOrFile) !== null ||
    parseKnowledgeSlugOrFileName(slugOrFile) !== null
  );
}
