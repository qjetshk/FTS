import { FTS_COUNTRIES } from "@/shared/config"
import type { StatFormRunStage, StatFormRunStatus, StatFormStatus } from "../model/statform.type"

type BadgeVariant = "success" | "warning" | "destructive" | "secondary"

export const RUN_STATUS: Record<StatFormRunStatus, { label: string; variant: BadgeVariant }> = {
  PENDING:      { label: "В очереди",       variant: "secondary"   },
  BUILDING:     { label: "Генерируется",    variant: "secondary"   },
  READY:        { label: "Готово",          variant: "success"     },
  PARTIAL:      { label: "Частично",        variant: "warning"     },
  FAILED:       { label: "Ошибка",          variant: "destructive" },
  NEEDS_REVIEW: { label: "Нужна проверка",  variant: "warning"     },
}

// порядок = порядок шагов в индикаторе прогресса
export const RUN_STAGES: { stage: StatFormRunStage; label: string }[] = [
  { stage: "STARTED",           label: "Генерация начата"     },
  { stage: "REQUESTING_REPORT", label: "Получаем отчёт OZON"  },
  { stage: "REPORT_RECEIVED",   label: "Отчёт получен"        },
  { stage: "FILLING",           label: "Заполняем статформы"  },
]

export const isRunActive = (status: StatFormRunStatus) => status === "PENDING" || status === "BUILDING"

export const FILE_STATUS: Record<StatFormStatus, { label: string; variant: BadgeVariant }> = {
  PENDING:  { label: "В очереди",    variant: "secondary"   },
  BUILDING: { label: "Генерируется", variant: "secondary"   },
  READY:    { label: "Готов",        variant: "success"     },
  FAILED:   { label: "Ошибка",       variant: "destructive" },
}

const COUNTRY_MAP = new Map(FTS_COUNTRIES.map((c) => [c.alpha2, c.name]))

export function countryName(alpha2: string): string {
  return COUNTRY_MAP.get(alpha2) ?? alpha2
}
