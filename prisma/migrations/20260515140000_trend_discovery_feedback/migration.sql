-- AlterTable: discovery feedback & carry-over (see IMPLEMENTATION-PLAN §4.5)
ALTER TABLE "Trend" ADD COLUMN "feedbackStatus" TEXT;
ALTER TABLE "Trend" ADD COLUMN "feedbackAt" TIMESTAMP(3);
ALTER TABLE "Trend" ADD COLUMN "discoveryBatchId" TEXT;
ALTER TABLE "Trend" ADD COLUMN "savedUntil" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "Trend_userId_feedbackStatus_idx" ON "Trend"("userId", "feedbackStatus");
