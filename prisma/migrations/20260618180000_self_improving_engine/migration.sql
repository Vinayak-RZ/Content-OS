-- Self-improving content engine: attribution, improvement runs, proposals, insights role

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "rankingWeights" JSONB;

ALTER TABLE "KnowledgeFile" ADD COLUMN IF NOT EXISTS "isAgentManaged" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "KnowledgeFile" ADD COLUMN IF NOT EXISTS "lastImprovementRunId" TEXT;

ALTER TABLE "SocialPost" ADD COLUMN IF NOT EXISTS "attributionConfidence" DOUBLE PRECISION;
ALTER TABLE "SocialPost" ADD COLUMN IF NOT EXISTS "attributionMethod" TEXT;

CREATE TABLE IF NOT EXISTS "ImprovementRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "step" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "summary" JSONB,
    "error" TEXT,

    CONSTRAINT "ImprovementRun_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ImprovementProposal" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "currentValue" JSONB NOT NULL,
    "proposedValue" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "decidedAt" TIMESTAMP(3),

    CONSTRAINT "ImprovementProposal_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "ImprovementRun_userId_startedAt_idx" ON "ImprovementRun"("userId", "startedAt");
CREATE INDEX IF NOT EXISTS "ImprovementProposal_userId_status_idx" ON "ImprovementProposal"("userId", "status");
CREATE INDEX IF NOT EXISTS "ImprovementProposal_runId_idx" ON "ImprovementProposal"("runId");

ALTER TABLE "ImprovementRun" ADD CONSTRAINT "ImprovementRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImprovementProposal" ADD CONSTRAINT "ImprovementProposal_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ImprovementProposal" ADD CONSTRAINT "ImprovementProposal_runId_fkey" FOREIGN KEY ("runId") REFERENCES "ImprovementRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
