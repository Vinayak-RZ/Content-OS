-- AlterTable
ALTER TABLE "Draft" ADD COLUMN "xThreadParts" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "DiscoveryRun" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "runAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "success" BOOLEAN NOT NULL DEFAULT true,
    "sourceCounts" JSONB NOT NULL,
    "totalDiscovered" INTEGER NOT NULL,
    "newStored" INTEGER NOT NULL,
    "carriedOver" INTEGER NOT NULL,
    "durationMs" INTEGER NOT NULL,
    "errorMessage" TEXT,

    CONSTRAINT "DiscoveryRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DiscoveryRunTopic" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "trendId" TEXT,
    "topicTitle" TEXT NOT NULL,
    "finalScore" DOUBLE PRECISION NOT NULL,
    "source" TEXT,
    "role" TEXT NOT NULL,

    CONSTRAINT "DiscoveryRunTopic_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Trend_userId_discoveryBatchId_idx" ON "Trend"("userId", "discoveryBatchId");

-- CreateIndex
CREATE UNIQUE INDEX "DiscoveryRun_userId_batchId_key" ON "DiscoveryRun"("userId", "batchId");

-- CreateIndex
CREATE INDEX "DiscoveryRun_userId_runAt_idx" ON "DiscoveryRun"("userId", "runAt");

-- CreateIndex
CREATE INDEX "DiscoveryRunTopic_runId_idx" ON "DiscoveryRunTopic"("runId");

-- AddForeignKey
ALTER TABLE "DiscoveryRun" ADD CONSTRAINT "DiscoveryRun_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryRunTopic" ADD CONSTRAINT "DiscoveryRunTopic_runId_fkey" FOREIGN KEY ("runId") REFERENCES "DiscoveryRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DiscoveryRunTopic" ADD CONSTRAINT "DiscoveryRunTopic_trendId_fkey" FOREIGN KEY ("trendId") REFERENCES "Trend"("id") ON DELETE SET NULL ON UPDATE CASCADE;
