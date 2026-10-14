-- CreateEnum
CREATE TYPE "PRODUCTS_SYNC_STATUS" AS ENUM ('RUNNING', 'DONE', 'FAILED');

-- AlterTable
ALTER TABLE "organizations" ADD COLUMN     "products_sync_error" TEXT,
ADD COLUMN     "products_sync_started_at" TIMESTAMP(3),
ADD COLUMN     "products_sync_status" "PRODUCTS_SYNC_STATUS";
