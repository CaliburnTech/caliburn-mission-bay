-- Replace the dead AWS-era anthropicKeyArn column with anthropicKeyEnc,
-- which stores the per-company Anthropic API key encrypted with
-- AES-256-GCM (base64: iv.ciphertext.authTag) using
-- ANTHROPIC_KEY_ENCRYPTION_SECRET. See api/_lib/crypto.js.

ALTER TABLE "Company" DROP COLUMN IF EXISTS "anthropicKeyArn";
ALTER TABLE "Company" ADD COLUMN IF NOT EXISTS "anthropicKeyEnc" TEXT;
