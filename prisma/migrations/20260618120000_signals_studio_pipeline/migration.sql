-- Dual pipeline: signals (external trends) vs studio (personal brand)

ALTER TABLE "Trend" ADD COLUMN "pipeline" TEXT NOT NULL DEFAULT 'signals';
ALTER TABLE "Draft" ADD COLUMN "pipeline" TEXT NOT NULL DEFAULT 'signals';
ALTER TABLE "DiscoveryRun" ADD COLUMN "pipeline" TEXT NOT NULL DEFAULT 'signals';

CREATE INDEX "Trend_userId_pipeline_discoveredAt_idx" ON "Trend"("userId", "pipeline", "discoveredAt");
