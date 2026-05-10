-- Обнулить строки со старыми значениями enum перед изменением типа
UPDATE "products" SET "tnved_status" = NULL WHERE "tnved_status" IN ('VERIFIED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "TNVED_STATUS_new" AS ENUM ('CLASSIFIED', 'NEEDS_REVIEW', 'VERIFIED_BY_USER', 'VERIFIED_BY_LLM');
ALTER TABLE "products" ALTER COLUMN "tnved_status" TYPE "TNVED_STATUS_new" USING ("tnved_status"::text::"TNVED_STATUS_new");
ALTER TYPE "TNVED_STATUS" RENAME TO "TNVED_STATUS_old";
ALTER TYPE "TNVED_STATUS_new" RENAME TO "TNVED_STATUS";
DROP TYPE "public"."TNVED_STATUS_old";
COMMIT;

-- CreateTable tnved_alternatives
CREATE TABLE "tnved_alternatives" (
    "id" TEXT NOT NULL,
    "tnved_code" TEXT NOT NULL,
    "tnved_name" TEXT,
    "tnved_unit" TEXT,
    "product_id" TEXT NOT NULL,

    CONSTRAINT "tnved_alternatives_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "tnved_alternatives" ADD CONSTRAINT "tnved_alternatives_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
