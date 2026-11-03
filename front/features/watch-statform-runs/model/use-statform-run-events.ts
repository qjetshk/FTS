"use client"

import { useCallback, useEffect, useRef } from "react"
import { useDispatch } from "react-redux"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useAuthEventStream, type StreamEvent } from "@/shared/api"
import { useGetAllOrgsQuery, useSelectedOrgId } from "@/entities/organization"
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
  // статусы прогонов открытой организации — чтобы не показать тоаст о прогоне, который уже был завершён до загрузки
  const orgId = useSelectedOrgId()
  const { data } = useGetStatformRunsQuery(orgId ?? "", { skip: !orgId })
  const { data: orgs = [] } = useGetAllOrgsQuery()

  // последний известный статус каждого прогона — чтобы тоаст был только на переходе, а не на каждом событии
  const statuses = useRef(new Map<string, StatFormRunStatus>())
  useEffect(() => {
    data?.forEach((r) => statuses.current.set(r.id, r.status))
  }, [data])

  const announce = useCallback(
    (run: StatFormRun) => {
      const title = formatPeriodTitle(run.period)
      const ready = run.statForms.filter((f) => f.status === "READY").length
      // события идут по всем организациям юзера — при нескольких подписываем, о какой речь
      const orgName = orgs.length > 1 ? orgs.find((o) => o.id === run.organizationId)?.fullOrg : undefined
      const withOrg = (text?: string) => (orgName ? [orgName, text].filter(Boolean).join(" · ") : text)
      switch (run.status) {
        case "READY":
          if (ready === 0) {
            toast.info(`За ${title} статформа не нужна`, { description: withOrg("Отгрузок в страны ЕАЭС в этом месяце не было") })
            break
          }
          toast.success(`Статформы за ${title} готовы`, {
            description: withOrg(`${filesLabel(ready)} — можно скачать здесь или из письма`),
          })
          break
        case "PARTIAL":
          toast.warning(`Статформы за ${title} готовы частично`, {
            description: withOrg(`${filesLabel(ready)}, по некоторым странам — ошибка`),
          })
          break
        case "NEEDS_REVIEW":
          toast.warning(`Генерация за ${title} остановлена`, {
            description: withOrg(run.failureReason ?? "Проверьте коды ТН ВЭД у товаров"),
            action: { label: "К товарам", onClick: () => router.push(ROUTES.products) },
            duration: 10_000,
          })
          break
        case "FAILED":
          toast.error(`Не удалось сформировать статформы за ${title}`, {
            description: withOrg(run.failureReason ?? undefined),
            duration: 10_000,
          })
          break
      }
    },
    [router, orgs],
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
