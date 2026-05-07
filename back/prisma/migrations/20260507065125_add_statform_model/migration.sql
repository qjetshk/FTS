-- CreateTable
CREATE TABLE "stat_forms" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "encrypted_xml" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stat_forms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stat_forms_org_id_idx" ON "stat_forms"("org_id");

-- CreateIndex
CREATE UNIQUE INDEX "stat_forms_org_id_country_period_key" ON "stat_forms"("org_id", "country", "period");

-- AddForeignKey
ALTER TABLE "stat_forms" ADD CONSTRAINT "stat_forms_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
