import { z } from "zod";

export const xThreadGenerationSchema = z.object({
  tweets: z.array(z.string().min(1).max(500)).min(2).max(3),
});
