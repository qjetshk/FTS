"use client"

import { Button } from "@/shared/ui"
import { useGetProductsSnapshotQuery, isNeedsAttention } from "@/entities/product"
import { useCompleteOnboardingMutation } from "@/entities/user"
import { ProductsTable } from "@/widgets/products-table/ProductsTable"

type Props = {
  clientId: number
  onComplete: () => void
}

export function ProductsReviewStep({ clientId, onComplete }: Props) {
  const { data: snapshot = [] } = useGetProductsSnapshotQuery(clientId, {
    pollingInterval: 5000,
    skip: !clientId,
  })
  const [completeOnboarding, { isLoading: completing }] = useCompleteOnboardingMutation()

  const total = snapshot.length
  const classified = snapshot.filter(p => p.tnvedStatus !== null).length
  const needsAttention = snapshot.filter(p =>
    isNeedsAttention({ tnvedStatus: p.tnvedStatus, countryConflict: p.countryConflict, country: p.country })
  ).length
  const allDone = total > 0 && classified === total && needsAttention === 0

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
        <ProductsTable clientId={clientId} />
      </div>

      <div className="shrink-0">
        <Button onClick={async () => { await completeOnboarding(); onComplete() }} disabled={!allDone || completing} className="w-full">
          {completing ? "Сохраняем..." : allDone ? "Всё проверено — перейти в дашборд" : "Исправьте все ошибки чтобы продолжить"}
        </Button>
      </div>

    </div>
  )
}
