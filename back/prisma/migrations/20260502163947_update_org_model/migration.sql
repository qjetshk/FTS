/*
  Warnings:

  - A unique constraint covering the columns `[ozon_client_id]` on the table `organizations` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "organizations_ozon_client_id_key" ON "organizations"("ozon_client_id");
