import { z } from "zod";

export const draftEditBodySchema = z.object({
  command: z.enum([
    "shortenLight",
    "shorten100",
    "shortenHeavy",
    "shorten",
    "rewrite",
    "strongerHook",
    "moreTechnical",
    "lessDramatic",
    "founderFraming",
    "clearerExplanation",
    "addAnalogy",
    "improveEnding",
    "addHashtags",
    "custom",
  ]),
  customInstruction: z.string().max(2000).optional(),
});
