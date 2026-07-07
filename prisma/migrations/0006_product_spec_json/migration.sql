-- Maker-authored spec data (SWaP + custom fields) held on the Product while it
-- is a draft / in review, before an admin publishes it into a ProductVersion.
-- Shape: { "swap": { ...optional fields... }, "customFields": [{ "label", "value" }] }
-- Additive and nullable — safe to apply live.

ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "specJson" JSONB;
