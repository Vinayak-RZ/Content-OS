-- Buffer integration: user fields + social analytics tables

ALTER TABLE "User" ADD COLUMN "bufferApiKey" TEXT;
ALTER TABLE "User" ADD COLUMN "bufferOrganizationId" TEXT;
ALTER TABLE "User" ADD COLUMN "bufferLastSyncAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN "bufferLastSyncError" TEXT;

CREATE TABLE "BufferChannel" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bufferChannelId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT,
    "avatar" TEXT,
    "isQueuePaused" BOOLEAN NOT NULL DEFAULT false,
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BufferChannel_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bufferPostId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "draftId" TEXT,
    "text" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "scheduledAt" TIMESTAMP(3),
    "metricsUpdatedAt" TIMESTAMP(3),
    "metrics" JSONB NOT NULL DEFAULT '[]',
    "lastSyncedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SocialPost_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SocialPostMetricSnapshot" (
    "id" TEXT NOT NULL,
    "socialPostId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" TEXT NOT NULL,
    "recordedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialPostMetricSnapshot_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "BufferChannel_userId_bufferChannelId_key" ON "BufferChannel"("userId", "bufferChannelId");
CREATE INDEX "BufferChannel_userId_service_idx" ON "BufferChannel"("userId", "service");

CREATE UNIQUE INDEX "SocialPost_userId_bufferPostId_key" ON "SocialPost"("userId", "bufferPostId");
CREATE INDEX "SocialPost_userId_publishedAt_idx" ON "SocialPost"("userId", "publishedAt");
CREATE INDEX "SocialPost_userId_status_idx" ON "SocialPost"("userId", "status");

CREATE INDEX "SocialPostMetricSnapshot_socialPostId_type_recordedAt_idx" ON "SocialPostMetricSnapshot"("socialPostId", "type", "recordedAt");

ALTER TABLE "BufferChannel" ADD CONSTRAINT "BufferChannel_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "BufferChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SocialPost" ADD CONSTRAINT "SocialPost_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "Draft"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "SocialPostMetricSnapshot" ADD CONSTRAINT "SocialPostMetricSnapshot_socialPostId_fkey" FOREIGN KEY ("socialPostId") REFERENCES "SocialPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;
