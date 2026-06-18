import { z } from "zod";

import { DRAFT_PROVIDER_KINDS } from "@/lib/llm/models";
import { PERSONA_TYPES } from "@/lib/personas/types";

export const settingsPatchSchema = z
  .object({
    timezone: z.string().min(1).max(64).optional(),
    emailDigest: z.boolean().optional(),
    personaType: z.enum(PERSONA_TYPES).optional(),
    personaCustom: z.string().min(1).max(500).optional(),
    tavilyApiKey: z.string().min(1).optional(),
    firecrawlApiKey: z.string().min(1).optional(),
    openrouterKey: z.string().min(1).optional(),
    nvidiaKey: z.string().min(1).optional(),
    openaiKey: z.string().min(1).optional(),
    bufferApiKey: z.string().min(1).optional(),
    bufferOrganizationId: z.string().min(1).optional(),
    draftProvider: z.enum(DRAFT_PROVIDER_KINDS).optional(),
    draftModelId: z.string().min(1).max(200).optional(),
    clearTavily: z.boolean().optional(),
    clearFirecrawl: z.boolean().optional(),
    clearOpenrouter: z.boolean().optional(),
    clearNvidia: z.boolean().optional(),
    clearOpenai: z.boolean().optional(),
    clearBuffer: z.boolean().optional(),
    onboardingCompleted: z.boolean().optional(),
  })
  .strict();

export type SettingsPatchInput = z.infer<typeof settingsPatchSchema>;
