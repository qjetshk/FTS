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

export function isNeedsAttention(product: { tnvedStatus: TnvedStatus | null; countryConflict: boolean; country: string | null }) {
  return product.tnvedStatus === "NEEDS_REVIEW" || product.countryConflict || !product.country
}

export function isGreen(product: { tnvedStatus: TnvedStatus | null; countryConflict: boolean; country: string | null }) {
  return !isNeedsAttention(product) && product.tnvedStatus !== null
}
