-- Rename User.cognitoSub → User.authId
-- Reflects the Supabase pivot: field stores Supabase auth.users.id (UUID),
-- not a Cognito sub claim. No data loss — rename only.

ALTER TABLE "User" RENAME COLUMN "cognitoSub" TO "authId";

-- Index was created as "User_cognitoSub_key" — drop and recreate under new name.
DROP INDEX "User_cognitoSub_key";
CREATE UNIQUE INDEX "User_authId_key" ON "User"("authId");
