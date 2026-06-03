import { FTS_COUNTRIES } from "@/shared/config"
import type { StatFormRunStatus, StatFormStatus } from "../model/statform.type"

type BadgeVariant = "success" | "warning" | "destructive" | "secondary"

export const RUN_STATUS: Record<StatFormRunStatus, { label: string; variant: BadgeVariant }> = {
  BUILDING: { label: "Генерируется", variant: "secondary" },
  READY:    { label: "Готово",       variant: "success"   },
  PARTIAL:  { label: "Частично",     variant: "warning"   },
  FAILED:   { label: "Ошибка",       variant: "destructive" },
}

export const FILE_STATUS: Record<StatFormStatus, { label: string; variant: BadgeVariant }> = {
  BUILDING: { label: "Генерируется", variant: "secondary"   },
  READY:    { label: "Готов",        variant: "success"     },
  FAILED:   { label: "Ошибка",       variant: "destructive" },
}

const COUNTRY_MAP = new Map(FTS_COUNTRIES.map((c) => [c.alpha2, c.name]))

export function countryName(alpha2: string): string {
  return COUNTRY_MAP.get(alpha2) ?? alpha2
}
