-- Migration: 0003_sbom_supabase_storage
-- Replaces s3Key + s3Bucket columns on the sboms table with a single
-- storagePath column pointing to Supabase Storage.
--
-- Run in Supabase SQL Editor, then register in _prisma_migrations:
--   INSERT INTO "_prisma_migrations" (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count)
--   VALUES (gen_random_uuid(), 'manual', now(), '0003_sbom_supabase_storage', NULL, NULL, now(), 1);

-- Step 1: add the new column (nullable first so existing rows don't break)
ALTER TABLE "sboms" ADD COLUMN "storagePath" TEXT;

-- Step 2: backfill existing rows — reconstruct a path from the old s3Key value
--         (there are likely no real rows yet, but this keeps it safe)
UPDATE "sboms" SET "storagePath" = "s3Key" WHERE "storagePath" IS NULL;

-- Step 3: make it required now that all rows have a value
ALTER TABLE "sboms" ALTER COLUMN "storagePath" SET NOT NULL;

-- Step 4: drop the old S3 columns
ALTER TABLE "sboms" DROP COLUMN "s3Key";
ALTER TABLE "sboms" DROP COLUMN "s3Bucket";

-- Step 5: add unique constraint on savedConfigurationId so upserts work
--         (one SBOM record per configuration)
CREATE UNIQUE INDEX IF NOT EXISTS "sboms_savedConfigurationId_key"
  ON "sboms" ("savedConfigurationId");
