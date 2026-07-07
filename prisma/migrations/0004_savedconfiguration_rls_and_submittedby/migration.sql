-- 0004: Lock down SavedConfiguration and formalize submittedBy.
--
-- Context: a live-DB check (2026-07-06) showed RLS enabled on every public
-- table EXCEPT "SavedConfiguration" (left open by the demo-anonymous-save
-- change), meaning anyone with the public anon key could read/write it via
-- PostgREST. All client access now goes through the authenticated Vercel API
-- (which connects as the table owner and is unaffected by RLS), so no
-- PostgREST policies are needed — enabling RLS with no policies denies
-- anon/authenticated PostgREST access entirely.
--
-- Also formalizes the "submittedBy" column the demo change added directly to
-- the live DB, so schema.prisma and the database agree.

ALTER TABLE "SavedConfiguration" ADD COLUMN IF NOT EXISTS "submittedBy" TEXT;

ALTER TABLE "SavedConfiguration" ENABLE ROW LEVEL SECURITY;
