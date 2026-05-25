-- Fix misspelled column name on licenses table (DA-7)
ALTER TABLE "licenses" RENAME COLUMN "isProprietory" TO "isProprietary";
