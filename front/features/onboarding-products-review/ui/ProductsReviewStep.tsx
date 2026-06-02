"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/shared/ui"
import {
  useGetProductsSnapshotQuery,
  useUpdateTnvedMutation,
  useUpdateCountryMutation,
  isNeedsAttention,
} from "@/entities/product"
import { useCompleteOnboardingMutation } from "@/entities/user"
import { ProductsTable, type PendingTnved } from "@/widgets/products-table/ProductsTable"

type Props = {
  clientId: number
  onComplete: () => void
}

export function ProductsReviewStep({ clientId, onComplete }: Props) {
  const [pendingTnved, setPendingTnved] = useState<Record<number, PendingTnved>>({})
  const [pendingCountry, setPendingCountry] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const { data: snapshot = [] } = useGetProductsSnapshotQuery(clientId, {
    pollingInterval: 5000,
    skip: !clientId,
  })
  const [completeOnboarding, { isLoading: completing }] = useCompleteOnboardingMutation()
  const [updateTnved] = useUpdateTnvedMutation()
  const [updateCountry] = useUpdateCountryMutation()

  const total = snapshot.length
  const classified = snapshot.filter(p => p.tnvedStatus !== null).length

  // Consider pending selections as effectively resolved
  const effectiveNeedsAttention = snapshot.filter(p => {
    const tnvedOk = !!pendingTnved[p.productId] || p.tnvedStatus !== "NEEDS_REVIEW"
    const countryOk = !!pendingCountry[p.productId] || (!p.countryConflict && !!p.country)
    return !tnvedOk || !countryOk
  }).length

  const canProceed = total > 0 && classified === total && effectiveNeedsAttention === 0

  const handleTnvedSelect = (productId: number, code: string, name: string | null, unit: string | null) => {
    setPendingTnved(prev => ({ ...prev, [productId]: { tnvedCode: code, tnvedName: name, tnvedUnit: unit } }))
  }

  const handleCountrySelect = (productId: number, country: string) => {
    setPendingCountry(prev => ({ ...prev, [productId]: country }))
  }

  const handleContinue = async () => {
    setIsSaving(true)
    try {
      await Promise.all([
        ...Object.entries(pendingTnved).map(([productId, p]) =>
          updateTnved({
            productId: Number(productId),
            clientId,
            tnvedCode: p.tnvedCode,
            tnvedName: p.tnvedName,
            tnvedUnit: p.tnvedUnit,
            tnvedStatus: "VERIFIED_BY_USER",
            tnvedAlternatives: [],
          }).unwrap()
        ),
        ...Object.entries(pendingCountry).map(([productId, country]) =>
          updateCountry({
            productId: Number(productId),
            clientId,
            country,
          }).unwrap()
        ),
      ])
      await completeOnboarding()
      onComplete()
    } catch {
      toast.error("Не удалось сохранить изменения")
    } finally {
      setIsSaving(false)
    }
  }

  const hasPending = Object.keys(pendingTnved).length > 0 || Object.keys(pendingCountry).length > 0

  const buttonLabel = () => {
    if (isSaving || completing) return "Сохраняем..."
    if (!canProceed) return "Исправьте все ошибки чтобы продолжить"
    if (hasPending) return "Сохранить и перейти в дашборд"
    return "Всё проверено — перейти в дашборд"
  }

  return (
    <div className="w-full h-[calc(100vh-7rem)] flex flex-col gap-3">

      <div className="shrink-0 text-center">
        <h2 className="text-lg font-semibold">Классификация товаров</h2>
        {classified < total && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center mt-1">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Идёт классификация: {classified}/{total}
          </div>
        )}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2.5 rounded-sm bg-red-400 shrink-0" />Нет страны или их конфликт /  ИИ сомневается в ТН ВЭД</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2.5 rounded-sm bg-yellow-300 shrink-0" />ИИ классифицировал сам, требует проверки</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2.5 rounded-sm bg-green-400 shrink-0" />Проверен ИИ</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ProductsTable
          clientId={clientId}
          pendingTnvedMap={pendingTnved}
          onTnvedSelect={handleTnvedSelect}
          pendingCountryMap={pendingCountry}
          onCountrySelect={handleCountrySelect}
        />
      </div>

      <div className="shrink-0">
        <Button
          onClick={handleContinue}
          disabled={!canProceed || isSaving || completing}
          className="w-full"
        >
          {buttonLabel()}
        </Button>
      </div>

    </div>
  )
}
