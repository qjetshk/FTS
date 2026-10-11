"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Loader2, Play } from "lucide-react"
import { Button } from "@/shared/ui"
import { getApiErrorMessage, getApiRetryAfter } from "@/shared/lib"
import {
  useRunStatformsMutation,
  useGetStatformRunsQuery,
  isRunActive,
  previousMonth,
  formatPeriodTitle,
} from "@/entities/statform"

// Кнопка заблокирована, пока генерация за период идёт (статус приходит по SSE) и после 429 до сброса лимита.
// Настоящая защита — на бэке (409 активный прогон / 429 лимит), здесь — чтобы не спамить запросами.
export function RunStatformsButton() {
  const period = previousMonth()
  const [run, { isLoading }] = useRunStatformsMutation()
  const { data: runs } = useGetStatformRunsQuery()
  const [blockedUntil, setBlockedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  const inProgress = runs?.some((r) => r.period === period && isRunActive(r.status)) ?? false
  const cooldownSec = Math.max(0, Math.ceil((blockedUntil - now) / 1000))

  // тикаем раз в секунду, только пока идёт кулдаун
  useEffect(() => {
    if (blockedUntil <= Date.now()) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [blockedUntil])

  async function handleClick() {
    try {
      await run({ period }).unwrap()
      toast.success(`Генерация за ${formatPeriodTitle(period)} запущена`)
    } catch (e) {
      const retryAfter = getApiRetryAfter(e)
      if (retryAfter) {
        setBlockedUntil(Date.now() + retryAfter * 1000)
        setNow(Date.now())
      }
      toast.error(getApiErrorMessage(e, "Не удалось запустить генерацию"))
    }
  }

  const label = inProgress
    ? "Генерация идёт…"
    : cooldownSec > 0
      ? `Можно через ${Math.ceil(cooldownSec / 60)} мин`
      : "Сгенерировать статформы"

  return (
    <Button onClick={handleClick} disabled={isLoading || inProgress || cooldownSec > 0}>
      {isLoading || inProgress ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
      {label}
    </Button>
  )
}
