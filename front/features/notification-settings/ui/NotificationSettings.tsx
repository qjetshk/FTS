"use client"

import { toast } from "sonner"
import { Button } from "@/shared/ui"
import { getApiErrorMessage } from "@/shared/lib"
import { useMeQuery, useUpdateNotificationChannelMutation, type NotificationChannel } from "@/entities/user"

type Option = { value: NotificationChannel; label: string; needsEmail: boolean; needsTelegram: boolean }

const OPTIONS: Option[] = [
  { value: "EMAIL", label: "Почта", needsEmail: true, needsTelegram: false },
  { value: "TELEGRAM", label: "Telegram", needsEmail: false, needsTelegram: true },
  { value: "BOTH", label: "Оба", needsEmail: true, needsTelegram: true },
]

// Только выбор канала: все события идут туда, выключить уведомления совсем нельзя
export function NotificationSettings() {
  const { data: user } = useMeQuery()
  const [update, { isLoading }] = useUpdateNotificationChannelMutation()

  if (!user) return null
  const hasEmail = !!user.email
  const hasTelegram = user.telegramLinked

  // выбранный канал недоступен (Telegram отвязан, почты нет) → бэк шлёт в оставшийся, показываем его
  const effective: NotificationChannel =
    !hasTelegram ? "EMAIL" : !hasEmail ? "TELEGRAM" : user.notificationChannel

  const select = async (channel: NotificationChannel) => {
    if (channel === effective) return
    try {
      await update({ channel }).unwrap()
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось сохранить"))
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-0.5">
        <span className="text-sm font-medium">Куда присылать уведомления</span>
        <span className="text-xs text-muted-foreground">
          Готовые статформы и проблемы: ошибки формирования, проверка ТН ВЭД, доступ к OZON
        </span>
      </div>

      <div role="radiogroup" aria-label="Канал уведомлений" className="grid grid-cols-3 gap-2">
        {OPTIONS.map((o) => {
          const available = (!o.needsEmail || hasEmail) && (!o.needsTelegram || hasTelegram)
          const active = o.value === effective
          return (
            <Button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={active}
              variant={active ? "default" : "outline"}
              size="sm"
              disabled={!available || isLoading}
              onClick={() => select(o.value)}
            >
              {o.label}
            </Button>
          )
        })}
      </div>

      {(!hasTelegram || !hasEmail) && (
        <p className="text-xs text-muted-foreground">
          {hasTelegram ? "Привяжите почту, чтобы получать уведомления и туда" : "Привяжите Telegram выше, чтобы получать уведомления в мессенджер"}
        </p>
      )}
    </div>
  )
}
