import { z } from "zod";

export const draftEditBodySchema = z.object({
  command: z.enum([
    "shorten",
    "rewrite",
    "strongerHook",
    "moreTechnical",
    "lessDramatic",
    "founderFraming",
    "clearerExplanation",
    "addAnalogy",
    "improveEnding",
    "custom",
  ]),
  customInstruction: z.string().max(2000).optional(),
});
