"use client"

import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { FileUp, Loader2, Play } from "lucide-react"
import { Button, Input, MonthPicker } from "@/shared/ui"
import { useSelectedOrgId } from "@/entities/organization"
import { getApiErrorMessage, getApiRetryAfter } from "@/shared/lib"
import {
  useRunStatformsMutation,
  useRunStatformsUploadMutation,
  useGetStatformRunsQuery,
  isRunActive,
  previousMonth,
  formatPeriodTitle,
} from "@/entities/statform"

// глубже OZON всё равно не отдаёт отчёты по API, а вручную за давние месяцы статформы уже не сдают
const MONTHS_BACK = 24

function shiftPeriod(period: string, months: number): string {
  const [y, m] = period.split("-").map(Number)
  const d = new Date(y, m - 1 + months, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
}

// Месяц + запуск: по API OZON или по загруженному CSV-отчёту.
// Кнопки заблокированы, пока генерация за месяц идёт (статус по SSE) и после 429 до сброса лимита.
// Настоящая защита — на бэке (409 активный прогон / 429 лимит / 422 не тот отчёт), здесь — чтобы не спамить запросами.
export function RunStatformsButton() {
  const maxPeriod = previousMonth()
  const [period, setPeriod] = useState(maxPeriod)
  const orgId = useSelectedOrgId()
  const [run, { isLoading: running }] = useRunStatformsMutation()
  const [upload, { isLoading: uploading }] = useRunStatformsUploadMutation()
  const { data: runs } = useGetStatformRunsQuery(orgId ?? "", { skip: !orgId })
  const [blockedUntil, setBlockedUntil] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const fileInput = useRef<HTMLInputElement>(null)

  const inProgress = runs?.some((r) => r.period === period && isRunActive(r.status)) ?? false
  const cooldownSec = Math.max(0, Math.ceil((blockedUntil - now) / 1000))
  const busy = running || uploading || inProgress || cooldownSec > 0 || !orgId

  // тикаем раз в секунду, только пока идёт кулдаун
  useEffect(() => {
    if (blockedUntil <= Date.now()) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [blockedUntil])

  const handleError = (e: unknown, fallback: string) => {
    const retryAfter = getApiRetryAfter(e)
    if (retryAfter) {
      setBlockedUntil(Date.now() + retryAfter * 1000)
      setNow(Date.now())
    }
    toast.error(getApiErrorMessage(e, fallback))
  }

  async function startFromOzon() {
    if (!orgId) return
    try {
      await run({ period, orgId }).unwrap()
      toast.success(`Генерация за ${formatPeriodTitle(period)} запущена`)
    } catch (e) {
      handleError(e, "Не удалось запустить генерацию")
    }
  }

  async function startFromFile(file: File) {
    if (!orgId) return
    try {
      await upload({ period, orgId, file }).unwrap()
      toast.success(`Отчёт принят — генерация за ${formatPeriodTitle(period)} запущена`)
    } catch (e) {
      // 422 — отчёт не за этот месяц / не тот файл: текст бэка объясняет, что исправить
      handleError(e, "Не удалось загрузить отчёт")
    }
  }

  const label = inProgress
    ? "Генерация идёт…"
    : cooldownSec > 0
      ? `Можно через ${Math.ceil(cooldownSec / 60)} мин`
      : "Сгенерировать статформы"

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <MonthPicker
        value={period}
        onChange={setPeriod}
        min={shiftPeriod(maxPeriod, -MONTHS_BACK)}
        max={maxPeriod}
        disabled={running || uploading}
      />
      <Input
        ref={fileInput}
        type="file"
        accept=".csv,text/csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          // сброс — тот же файл можно выбрать снова после исправления месяца
          e.target.value = ""
          if (file) startFromFile(file)
        }}
      />
      <Button
        variant="outline"
        onClick={() => fileInput.current?.click()}
        disabled={busy}
        // статформа — по дате отгрузки, а OZON отбирает отчёт по дате приёма заказа: нужен ещё прошлый месяц
        title="Отчёт «Заказы» из кабинета OZON (CSV) за выбранный и предыдущий месяц — чтобы учесть заказы, принятые в конце прошлого месяца и отгруженные в выбранном"
      >
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <FileUp className="size-4" />}
        Загрузить CSV
      </Button>
      <Button onClick={startFromOzon} disabled={busy}>
        {running || inProgress ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
        {label}
      </Button>
    </div>
  )
}
