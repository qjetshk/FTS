"use client"

import { useCallback, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthEventStream, type StreamEvent } from "@/shared/api"
import { ROUTES } from "@/shared/config"
import {
  useGetStatformRunsQuery,
  upsertStatformRun,
  isRunActive,
  formatPeriodTitle,
  type StatFormRun,
  type StatFormRunStatus,
  type StatformApiDispatch,
} from "@/entities/statform"

const filesLabel = (n: number) => `${n} ${n === 1 ? "файл" : n < 5 ? "файла" : "файлов"}`

// Живые статусы генерации: SSE → кэш списка прогонов + тоаст, когда прогон завершился
export function useStatformRunEvents() {
  const dispatch = useDispatch<StatformApiDispatch>()
  const router = useRouter()
  const { data } = useGetStatformRunsQuery()

  // последний известный статус каждого прогона — чтобы тоаст был только на переходе, а не на каждом событии
  const statuses = useRef(new Map<string, StatFormRunStatus>())
  useEffect(() => {
    data?.forEach((r) => statuses.current.set(r.id, r.status))
  }, [data])

  const announce = useCallback(
    (run: StatFormRun) => {
      const title = formatPeriodTitle(run.period)
      const ready = run.statForms.filter((f) => f.status === "READY").length
      switch (run.status) {
        case "READY":
          toast.success(`Статформы за ${title} готовы`, {
            description: `${filesLabel(ready)} — можно скачать здесь или из письма`,
          })
          break
        case "PARTIAL":
          toast.warning(`Статформы за ${title} готовы частично`, {
            description: `${filesLabel(ready)}, по некоторым странам — ошибка`,
          })
          break
        case "NEEDS_REVIEW":
          toast.warning(`Генерация за ${title} остановлена`, {
            description: run.failureReason ?? "Проверьте коды ТН ВЭД у товаров",
            action: { label: "К товарам", onClick: () => router.push(ROUTES.products) },
            duration: 10_000,
          })
          break
        case "FAILED":
          toast.error(`Не удалось сформировать статформы за ${title}`, {
            description: run.failureReason ?? undefined,
            duration: 10_000,
          })
          break
      }
    },
    [router],
  )

  const onEvent = useCallback(
    ({ event, data: raw }: StreamEvent) => {
      if (event !== "run") return
      const run = JSON.parse(raw) as StatFormRun
      const prev = statuses.current.get(run.id)
      statuses.current.set(run.id, run.status)

      dispatch(upsertStatformRun(run))
      if (prev !== run.status && !isRunActive(run.status) && (prev === undefined || isRunActive(prev))) {
        announce(run)
      }
    },
    [dispatch, announce],
  )

  useAuthEventStream("/statforms/events", onEvent)
}
