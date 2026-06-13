-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "currentContent" TEXT NOT NULL,
    "sources" TEXT[],
    "sourceTexts" JSONB NOT NULL DEFAULT '[]',
    "readTimeMinutes" INTEGER NOT NULL DEFAULT 5,
    "revisionHistory" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BlogPost_userId_createdAt_idx" ON "BlogPost"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "BlogPost_userId_status_idx" ON "BlogPost"("userId", "status");

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
