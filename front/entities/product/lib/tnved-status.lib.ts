import type { TnvedStatus } from "../model/product.type"

export const TNVED_STATUS_CONFIG: Record<
  NonNullable<TnvedStatus>,
  { label: string; bg: string; text: string }
> = {
  CLASSIFIED: {
    label: "Классифицирован",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  NEEDS_REVIEW: {
    label: "Требует проверки",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
  },
  VERIFIED_BY_USER: {
    label: "Подтверждён",
    bg: "bg-green-50",
    text: "text-green-700",
  },
  VERIFIED_BY_LLM: {
    label: "Подтверждён ИИ",
    bg: "bg-green-50",
    text: "text-green-700",
  },
}

type AttentionFields = {
  tnvedStatus: TnvedStatus | null
  tnvedCode: string | null
  countryConflict: boolean
  country: string | null
}

// Без кода ТН ВЭД статформа не соберётся — такой товар всегда требует внимания, какой бы ни был статус
export function isNeedsAttention(product: AttentionFields) {
  return product.tnvedStatus === "NEEDS_REVIEW" || !product.tnvedCode || product.countryConflict || !product.country
}

export function isGreen(product: AttentionFields) {
  return !isNeedsAttention(product) && product.tnvedStatus !== null
}
