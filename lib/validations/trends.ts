import { z } from "zod";

/** §4.5 — thumbs up / down / clear */
export const trendFeedbackPatchSchema = z.object({
  feedback: z.enum(["saved", "dismissed"]).nullable(),
});
