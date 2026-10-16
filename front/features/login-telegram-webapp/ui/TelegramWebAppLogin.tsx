"use client"

import Link from "next/link"
import Script from "next/script"
import { Loader2 } from "lucide-react"
import { Button, LogoMark } from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { useTelegramWebAppLogin } from "../lib/use-telegram-webapp-login.lib"
import { getTelegramWebApp } from "../lib/telegram-webapp.util"

// Экран Mini App на время входа: лоадер, а если страница открыта не из Telegram или вход не удался — пояснение
export function TelegramWebAppLogin() {
  const { status, retry } = useTelegramWebAppLogin()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-5 px-6 text-center">
      {/* SDK Telegram: ready() убирает заставку Telegram, expand() раскрывает Mini App на весь экран */}
      <Script
        src="https://telegram.org/js/telegram-web-app.js"
        strategy="afterInteractive"
        onReady={() => {
          getTelegramWebApp()?.ready()
          getTelegramWebApp()?.expand()
        }}
      />
      <LogoMark className="size-10" />
      {status.kind === "loading" && (
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" /> Входим через Telegram…
        </p>
      )}
      {status.kind === "not-telegram" && (
        <>
          <p className="max-w-[32ch] text-sm text-muted-foreground">
            Эта страница открывается из Telegram-бота. В браузере войдите по почте или через Telegram.
          </p>
          <Button nativeButton={false} render={<Link href={ROUTES.login} />}>Ко входу</Button>
        </>
      )}
      {status.kind === "error" && (
        <>
          <p className="max-w-[32ch] text-sm text-destructive">{status.message}</p>
          <Button onClick={retry}>Попробовать ещё раз</Button>
        </>
      )}
    </div>
  )
}
