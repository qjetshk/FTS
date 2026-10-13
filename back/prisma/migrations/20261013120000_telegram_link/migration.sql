-- AlterTable
ALTER TABLE "users" ADD COLUMN     "telegram_chat_id" BIGINT,
ADD COLUMN     "telegram_username" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_telegram_chat_id_key" ON "users"("telegram_chat_id");
