"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Send } from "lucide-react"
import { Button } from "@/shared/ui"
import { useCreateTelegramLinkMutation, useMeQuery, useUnlinkTelegramMutation } from "@/entities/user"

const POLL_INTERVAL = 3_000

export function TelegramLinkCard() {
  // до какого момента ждём, пока юзер нажмёт Start в боте (= срок жизни ссылки); null — не ждём
  const [waitUntil, setWaitUntil] = useState<number | null>(null)
  const { data: user } = useMeQuery()
  const linked = user?.telegramLinked ?? false
  const waiting = waitUntil !== null && !linked

  // пока ждём — опрашиваем /auth/@me, привязка происходит в боте, а не на этой странице
  useMeQuery(undefined, { pollingInterval: waiting ? POLL_INTERVAL : 0, skip: !waiting })
  const [createLink, { isLoading: creating }] = useCreateTelegramLinkMutation()
  const [unlink, { isLoading: unlinking }] = useUnlinkTelegramMutation()

  useEffect(() => {
    if (waitUntil !== null && linked) toast.success("Telegram привязан")
  }, [linked, waitUntil])

  // ссылка протухла — перестаём опрашивать
  useEffect(() => {
    if (!waiting) return
    const timer = setTimeout(() => setWaitUntil(null), waitUntil - Date.now())
    return () => clearTimeout(timer)
  }, [waiting, waitUntil])

  const handleLink = async () => {
    // вкладку открываем синхронно в обработчике клика — после await браузер заблокирует попап
    const tab = window.open("", "_blank")
    try {
      const { url, expiresIn } = await createLink().unwrap()
      if (tab) tab.location.href = url
      else window.location.href = url
      setWaitUntil(Date.now() + expiresIn * 1000)
    } catch {
      tab?.close()
      toast.error("Не удалось получить ссылку на бота, попробуйте позже")
    }
  }

  const handleUnlink = async () => {
    try {
      await unlink().unwrap()
      setWaitUntil(null)
      toast.success("Telegram отвязан")
    } catch {
      toast.error("Не удалось отвязать Telegram")
    }
  }

  const hint = linked
    ? user?.telegramUsername ? `@${user.telegramUsername}` : "Привязан"
    : waiting
      ? "Нажмите «Start» в боте…"
      : "Статформы и уведомления в мессенджер"

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border px-3 py-2.5">
      <div className="flex items-center gap-3 min-w-0">
        <Send strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium">Telegram</span>
          <span className="text-xs text-muted-foreground truncate">{hint}</span>
        </div>
      </div>
      {linked ? (
        // без почты Telegram — единственный вход: отвязать нельзя, пока не привязана почта
        <Button
          variant="outline"
          size="sm"
          onClick={handleUnlink}
          disabled={unlinking || !user?.email}
          title={user?.email ? undefined : "Сначала привяжите почту"}
        >
          Отвязать
        </Button>
      ) : (
        <Button size="sm" onClick={handleLink} disabled={creating}>
          {waiting ? "Открыть снова" : "Привязать"}
        </Button>
      )}
    </div>
  )
}
