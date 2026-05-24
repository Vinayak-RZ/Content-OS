-- Draft provider: OpenAI key, explicit provider/model, optional onboarding

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "openaiKey" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "draftProvider" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "draftModelId" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "onboardingCompletedAt" TIMESTAMP(3);

-- Existing users should not be forced through onboarding again
UPDATE "User"
SET "onboardingCompletedAt" = COALESCE("onboardingCompletedAt", NOW())
WHERE "onboardingCompletedAt" IS NULL;
