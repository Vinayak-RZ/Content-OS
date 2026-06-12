import { z } from "zod";

export const draftPatchSchema = z
  .object({
    currentContent: z.string().max(100_000).optional(),
    selectedHook: z.number().int().min(0).max(2).optional(),
    selectedCta: z.number().int().min(0).max(9).optional(),
    xThreadParts: z.array(z.string().max(500)).max(10).optional(),
    status: z.enum(["draft", "approved", "published"]).optional(),
    restoreRevisionId: z.string().uuid().optional(),
  })
  .refine(
    (d) =>
      d.currentContent !== undefined ||
      d.selectedHook !== undefined ||
      d.selectedCta !== undefined ||
      d.xThreadParts !== undefined ||
      d.status !== undefined ||
      d.restoreRevisionId !== undefined,
    { message: "Empty PATCH body" },
  );

export type DraftPatchBody = z.infer<typeof draftPatchSchema>;
