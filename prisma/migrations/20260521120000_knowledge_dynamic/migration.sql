-- Dynamic knowledge: slug, displayName, role, sortOrder, isSystem

ALTER TABLE "KnowledgeFile" ADD COLUMN IF NOT EXISTS "slug" TEXT;
ALTER TABLE "KnowledgeFile" ADD COLUMN IF NOT EXISTS "displayName" TEXT;
ALTER TABLE "KnowledgeFile" ADD COLUMN IF NOT EXISTS "role" TEXT;
ALTER TABLE "KnowledgeFile" ADD COLUMN IF NOT EXISTS "sortOrder" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "KnowledgeFile" ADD COLUMN IF NOT EXISTS "isSystem" BOOLEAN NOT NULL DEFAULT false;

-- Backfill slug from fileName (strip .md)
UPDATE "KnowledgeFile"
SET "slug" = regexp_replace("fileName", '\.md$', '')
WHERE "slug" IS NULL;

-- System file metadata (canonical six)
UPDATE "KnowledgeFile" SET "displayName" = 'Writing style', "role" = 'style', "sortOrder" = 0, "isSystem" = true
  WHERE "fileName" = 'writing-style.md';
UPDATE "KnowledgeFile" SET "displayName" = 'Soul', "role" = 'narrative', "sortOrder" = 1, "isSystem" = true
  WHERE "fileName" = 'soul.md';
UPDATE "KnowledgeFile" SET "displayName" = 'Startup journey', "role" = 'narrative', "sortOrder" = 2, "isSystem" = true
  WHERE "fileName" = 'startup-journey.md';
UPDATE "KnowledgeFile" SET "displayName" = 'Technical interests', "role" = 'technical', "sortOrder" = 3, "isSystem" = true
  WHERE "fileName" = 'technical-interests.md';
UPDATE "KnowledgeFile" SET "displayName" = 'Thoughts', "role" = 'technical', "sortOrder" = 4, "isSystem" = true
  WHERE "fileName" = 'thoughts.md';
UPDATE "KnowledgeFile" SET "displayName" = 'Platform context', "role" = 'technical', "sortOrder" = 5, "isSystem" = true
  WHERE "fileName" = 'platform-context.md';

-- Custom / unknown rows
UPDATE "KnowledgeFile"
SET
  "displayName" = COALESCE("displayName", initcap(replace(regexp_replace("fileName", '\.md$', ''), '-', ' '))),
  "role" = COALESCE("role", 'general')
WHERE "displayName" IS NULL OR "role" IS NULL;

ALTER TABLE "KnowledgeFile" ALTER COLUMN "slug" SET NOT NULL;
ALTER TABLE "KnowledgeFile" ALTER COLUMN "displayName" SET NOT NULL;
ALTER TABLE "KnowledgeFile" ALTER COLUMN "role" SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS "KnowledgeFile_userId_slug_key" ON "KnowledgeFile"("userId", "slug");
CREATE INDEX IF NOT EXISTS "KnowledgeFile_userId_role_idx" ON "KnowledgeFile"("userId", "role");
