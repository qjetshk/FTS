-- DropIndex
DROP INDEX "users_email_verify_token_key";

-- DropIndex
DROP INDEX "users_password_reset_token_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "email_verify_expiry",
DROP COLUMN "email_verify_token",
DROP COLUMN "password",
DROP COLUMN "password_reset_expiry",
DROP COLUMN "password_reset_token",
ALTER COLUMN "name" DROP NOT NULL;

