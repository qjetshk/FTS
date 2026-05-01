-- CreateEnum
CREATE TYPE "PLAN" AS ENUM ('TRIAL', 'BASIC', 'PRO');

-- CreateEnum
CREATE TYPE "PLAN_STATUS" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TNVED_STATUS" AS ENUM ('CLASSIFIED', 'NEEDS_REVIEW', 'VERIFIED', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "is_email_verified" BOOLEAN NOT NULL DEFAULT false,
    "email_verify_token" TEXT,
    "email_verify_expiry" TIMESTAMP(3),
    "password_reset_token" TEXT,
    "password_reset_expiry" TIMESTAMP(3),
    "plan" "PLAN" NOT NULL DEFAULT 'TRIAL',
    "plan_expires_at" TIMESTAMP(3),
    "plan_status" "PLAN_STATUS" NOT NULL DEFAULT 'ACTIVE',
    "trial_started_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_revoked" BOOLEAN NOT NULL DEFAULT false,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" TEXT NOT NULL,
    "ozon_client_id" INTEGER NOT NULL,
    "ozon_api_key" TEXT NOT NULL,
    "full_org" TEXT NOT NULL,
    "full_opf" TEXT NOT NULL,
    "inn" TEXT NOT NULL,
    "ogrn" TEXT NOT NULL,
    "kpp" TEXT,
    "okato_5" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "street" TEXT,
    "house" TEXT,
    "room" TEXT,
    "postal_code" TEXT NOT NULL,
    "org_lang" TEXT NOT NULL DEFAULT 'RU',
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "declarants" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "surname" TEXT,
    "patronymic" TEXT,
    "position" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "organization_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "declarants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" TEXT NOT NULL,
    "type_code" TEXT NOT NULL,
    "type_short" TEXT NOT NULL,
    "series" TEXT,
    "number" TEXT NOT NULL,
    "issued_by" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL,
    "declarant_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "offer_id" TEXT NOT NULL,
    "sku" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "category_path" TEXT NOT NULL,
    "primary_img" TEXT,
    "images" TEXT[],
    "country" TEXT,
    "countries_of_origin" TEXT[],
    "country_conflict" BOOLEAN NOT NULL DEFAULT false,
    "tnved_code" TEXT,
    "tnved_name" TEXT,
    "tnved_unit" TEXT,
    "tnved_status" "TNVED_STATUS",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "organization_id" TEXT,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_verify_token_key" ON "users"("email_verify_token");

-- CreateIndex
CREATE UNIQUE INDEX "users_password_reset_token_key" ON "users"("password_reset_token");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_inn_key" ON "organizations"("inn");

-- CreateIndex
CREATE UNIQUE INDEX "organizations_ogrn_key" ON "organizations"("ogrn");

-- CreateIndex
CREATE INDEX "organizations_user_id_idx" ON "organizations"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "declarants_organization_id_key" ON "declarants"("organization_id");

-- CreateIndex
CREATE INDEX "declarants_organization_id_idx" ON "declarants"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_declarant_id_key" ON "documents"("declarant_id");

-- CreateIndex
CREATE INDEX "documents_declarant_id_idx" ON "documents"("declarant_id");

-- CreateIndex
CREATE INDEX "products_organization_id_idx" ON "products"("organization_id");

-- CreateIndex
CREATE UNIQUE INDEX "products_product_id_organization_id_key" ON "products"("product_id", "organization_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "declarants" ADD CONSTRAINT "declarants_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_declarant_id_fkey" FOREIGN KEY ("declarant_id") REFERENCES "declarants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE SET NULL ON UPDATE CASCADE;
