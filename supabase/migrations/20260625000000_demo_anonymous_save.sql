-- Add submittedBy to SavedConfiguration
ALTER TABLE "SavedConfiguration"
  ADD COLUMN IF NOT EXISTS "submittedBy" TEXT;

-- Seed stable demo company (ON CONFLICT DO NOTHING = safe to re-run)
INSERT INTO "Company" (id, name, status, "isSeller", "createdAt", "updatedAt")
VALUES ('demo-company-00000000000', 'Public Demo', 'APPROVED', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- Seed stable demo user
INSERT INTO "User" (id, "companyId", email, name, role, status, "onboardingComplete", "createdAt", "updatedAt")
VALUES ('demo-user-000000000000', 'demo-company-00000000000', 'demo@caliburn.us', 'Public Demo User', 'MEMBER', 'ACTIVE', true, now(), now())
ON CONFLICT (id) DO NOTHING;
