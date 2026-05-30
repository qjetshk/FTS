-- CreateTable
CREATE TABLE "tnved_lc" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "unit" TEXT,

    CONSTRAINT "tnved_lc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tnved_lc_code_key" ON "tnved_lc"("code");
