"use client"

import { Mail } from "lucide-react"

// Почта как канал уведомлений — в одном стиле со строкой Telegram (TelegramLinkCard)
export function EmailChannelRow({ email }: { email: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5 min-w-0">
      <Mail strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-sm font-medium">Почта</span>
        <span className="text-xs text-muted-foreground truncate" title={email}>{email}</span>
      </div>
    </div>
  )
}
