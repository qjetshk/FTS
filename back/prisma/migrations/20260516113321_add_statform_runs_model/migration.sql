/*
  Warnings:

  - You are about to drop the column `org_id` on the `stat_forms` table. All the data in the column will be lost.
  - You are about to drop the column `period` on the `stat_forms` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[run_id,country]` on the table `stat_forms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `run_id` to the `stat_forms` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "RUN_STATUS" AS ENUM ('PENDING', 'BUILDING', 'READY', 'PARTIAL', 'FAILED');

-- CreateEnum
CREATE TYPE "STAT_FORM_STATUS" AS ENUM ('PENDING', 'READY', 'FAILED');

-- Clear test data to allow structural changes
TRUNCATE "stat_forms" CASCADE;

-- DropForeignKey
ALTER TABLE "stat_forms" DROP CONSTRAINT "stat_forms_org_id_fkey";

-- DropIndex
DROP INDEX "stat_forms_org_id_country_period_key";

-- DropIndex
DROP INDEX "stat_forms_org_id_idx";

-- AlterTable
ALTER TABLE "stat_forms" DROP COLUMN "org_id",
DROP COLUMN "period",
ADD COLUMN     "completed_at" TIMESTAMP(3),
ADD COLUMN     "items_count" INTEGER,
ADD COLUMN     "needs_review" INTEGER,
ADD COLUMN     "run_id" TEXT NOT NULL,
ADD COLUMN     "status" "STAT_FORM_STATUS" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "xml_filename" TEXT,
ALTER COLUMN "encrypted_xml" DROP NOT NULL;

-- CreateTable
CREATE TABLE "stat_form_runs" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "status" "RUN_STATUS" NOT NULL DEFAULT 'PENDING',
    "detected_countries" TEXT[],
    "countries_detected_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stat_form_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stat_form_runs_organization_id_idx" ON "stat_form_runs"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "stat_form_runs_organization_id_period_key" ON "stat_form_runs"("organization_id", "period");

-- CreateIndex
CREATE INDEX "stat_forms_run_id_idx" ON "stat_forms"("run_id");

-- CreateIndex
CREATE UNIQUE INDEX "stat_forms_run_id_country_key" ON "stat_forms"("run_id", "country");

-- AddForeignKey
ALTER TABLE "stat_form_runs" ADD CONSTRAINT "stat_form_runs_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stat_forms" ADD CONSTRAINT "stat_forms_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "stat_form_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
