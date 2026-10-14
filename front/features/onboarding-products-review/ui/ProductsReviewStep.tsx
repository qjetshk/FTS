"use client"

import { useEffect, useState } from "react"
import { useDispatch } from "react-redux"
import { toast } from "sonner"
import { Button } from "@/shared/ui"
import { baseApi } from "@/shared/api"
import {
  useGetProductsSnapshotQuery,
  useGetProductsSyncStatusQuery,
  useUpdateTnvedMutation,
  useVerifyAllTnvedMutation,
  useUpdateCountryMutation,
  isNeedsAttention,
  type PendingTnved,
} from "@/entities/product"
import { useClassifyMutation } from "@/entities/organization"
import { useCompleteOnboardingMutation } from "@/entities/user"
import { ProductsTable } from "@/widgets/products-table"
import { SyncStatusBanner } from "./SyncStatusBanner"

const POLL_MS = 5000

type Props = {
  clientId: number
  onComplete: () => void
}

export function ProductsReviewStep({ clientId, onComplete }: Props) {
  const [pendingTnved, setPendingTnved] = useState<Record<number, PendingTnved>>({})
  const [pendingCountry, setPendingCountry] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const { data: sync, refetch: refetchSync } = useGetProductsSyncStatusQuery(clientId, { skip: !clientId })
  const syncing = sync?.productsSyncStatus === "RUNNING"
  // опрос статуса — только пока синхронизация идёт (или статус ещё не пришёл); после DONE/FAILED — тишина
  useGetProductsSyncStatusQuery(clientId, { skip: !clientId || (!!sync && !syncing), pollingInterval: POLL_MS })
  const failed = sync?.productsSyncStatus === "FAILED"
  const { data: snapshot = [] } = useGetProductsSnapshotQuery(clientId, {
    pollingInterval: syncing ? POLL_MS : 0,
    skip: !clientId,
  })
  const [classify, { isLoading: retrying }] = useClassifyMutation()
  const dispatch = useDispatch()

  // синхронизация закончилась — последний опрос мог быть до финальных записей: перечитываем товары и счётчик
  useEffect(() => {
    if (sync && !syncing) dispatch(baseApi.util.invalidateTags(["Product"]))
  }, [sync, syncing, dispatch])
  const [completeOnboarding, { isLoading: completing }] = useCompleteOnboardingMutation()
  const [updateTnved] = useUpdateTnvedMutation()
  const [verifyAllTnved] = useVerifyAllTnvedMutation()
  const [updateCountry] = useUpdateCountryMutation()

  const total = snapshot.length
  const classified = snapshot.filter(p => p.tnvedStatus !== null).length

  // Consider pending selections as effectively resolved
  const effectiveNeedsAttention = snapshot.filter(p => {
    const tnvedOk = !!pendingTnved[p.productId] || (p.tnvedStatus !== "NEEDS_REVIEW" && !!p.tnvedCode)
    const countryOk = !!pendingCountry[p.productId] || (!p.countryConflict && !!p.country)
    return !tnvedOk || !countryOk
  }).length

  // пустой каталог или сбой загрузки не запирают онбординг: товары догрузит ежедневная синхронизация
  const canProceed = !syncing && (total === 0 || effectiveNeedsAttention === 0)

  const retrySync = async () => {
    try {
      await classify({ clientId: String(clientId) }).unwrap()
      refetchSync()
    } catch {
      toast.error("Не удалось запустить загрузку товаров")
    }
  }

  const handleTnvedSelect = (productId: number, code: string, name: string | null, unit: string | null) => {
    setPendingTnved(prev => ({ ...prev, [productId]: { tnvedCode: code, tnvedName: name, tnvedUnit: unit } }))
  }

  const handleCountrySelect = (productId: number, country: string) => {
    setPendingCountry(prev => ({ ...prev, [productId]: country }))
  }

  const handleContinue = async () => {
    setIsSaving(true)
    try {
      // Сохраняем явно выбранные юзером коды (с конкретными данными)
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
      // Массово помечаем все остальные классифицированные товары как VERIFIED_BY_USER
      if (total > 0) await verifyAllTnved({ clientId }).unwrap()
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
    if (syncing) return "Дождитесь окончания загрузки товаров"
    if (!canProceed) return "Исправьте все ошибки чтобы продолжить"
    if (total === 0) return "Продолжить без товаров"
    if (hasPending) return "Сохранить и перейти в дашборд"
    return "Всё проверено — перейти в дашборд"
  }

  return (
    <div className="w-full h-[calc(100vh-7rem)] flex flex-col gap-3">

      <div className="shrink-0 text-center">
        <h2 className="text-lg font-semibold">Классификация товаров</h2>
        {failed ? (
          <SyncStatusBanner state="failed" error={sync?.productsSyncError ?? null} retrying={retrying} onRetry={retrySync} />
        ) : syncing && total === 0 ? (
          <SyncStatusBanner state="loading" />
        ) : syncing || classified < total ? (
          <SyncStatusBanner state="progress" classified={classified} total={total} />
        ) : total === 0 && sync ? (
          <SyncStatusBanner state="empty" />
        ) : null}
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2.5 rounded-sm bg-red-400 shrink-0" />Нет страны или их конфликт /  ИИ сомневается в ТН ВЭД</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2.5 rounded-sm bg-yellow-300 shrink-0" />ИИ классифицировал сам, требует проверки</span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className="size-2.5 rounded-sm bg-green-400 shrink-0" />Проверен ИИ</span>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        <ProductsTable
          clientId={clientId}
          showClassificationProgress
          live={syncing}
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
