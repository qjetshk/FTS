"use client"

import { Send } from "lucide-react"
import { Button } from "@/shared/ui"
import { useTelegramLogin } from "../lib/use-telegram-login.lib"

export function TelegramLoginButton() {
  const { begin, cancel, starting, waitingUrl } = useTelegramLogin()

  if (waitingUrl) {
    return (
      <div className="flex w-full flex-col items-center gap-3 rounded-lg border border-border px-4 py-3 text-center">
        <p className="text-sm text-muted-foreground">
          Нажмите <span className="font-medium text-foreground">«Войти»</span> в боте — страница обновится сама
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" nativeButton={false} render={<a href={waitingUrl} target="_blank" rel="noreferrer" />}>
            Открыть Telegram
          </Button>
          <Button variant="ghost" size="sm" onClick={cancel}>
            Отмена
          </Button>
        </div>
      </div>
    )
  }

  return (
    <Button type="button" variant="outline" className="w-full" onClick={begin} disabled={starting}>
      <Send strokeWidth={1.5} className="size-4" />
      Войти через Telegram
    </Button>
  )
}
