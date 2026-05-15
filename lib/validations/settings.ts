import { z } from "zod";

export const settingsPatchSchema = z
  .object({
    timezone: z.string().min(1).max(64).optional(),
    emailDigest: z.boolean().optional(),
    tavilyApiKey: z.string().min(1).optional(),
    firecrawlApiKey: z.string().min(1).optional(),
    openrouterKey: z.string().min(1).optional(),
    nvidiaKey: z.string().min(1).optional(),
    clearTavily: z.boolean().optional(),
    clearFirecrawl: z.boolean().optional(),
    clearOpenrouter: z.boolean().optional(),
    clearNvidia: z.boolean().optional(),
  })
  .strict();

export type SettingsPatchInput = z.infer<typeof settingsPatchSchema>;
