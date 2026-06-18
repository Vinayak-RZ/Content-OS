import { z } from "zod";

export const bufferPublishSchema = z
  .object({
    draftId: z.string().uuid(),
    channelId: z.string().uuid(),
    mode: z.enum(["addToQueue", "customScheduled"]),
    dueAt: z.string().datetime().optional(),
  })
  .strict()
  .superRefine((data, ctx) => {
    if (data.mode === "customScheduled" && !data.dueAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "dueAt is required for scheduled posts",
        path: ["dueAt"],
      });
    }
  });

export type BufferPublishInput = z.infer<typeof bufferPublishSchema>;
