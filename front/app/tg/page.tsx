import type { Metadata } from "next"
import { TelegramWebAppLogin } from "@/features/login-telegram-webapp"

export const metadata: Metadata = {
  title: "easyfts",
  robots: { index: false, follow: false },
}

// Точка входа Telegram Mini App (адрес указан в BotFather): автоматический вход и переход в кабинет
export default function TelegramMiniAppPage() {
  return (
    <TelegramWebAppLogin />
  )
}
