"use client"

import { Button } from "@/shared/ui"
import { useGetProductsSnapshotQuery, isNeedsAttention } from "@/entities/product"
import { useCompleteOnboardingMutation } from "@/entities/user"

type Props = {
  clientId: number
  onComplete: () => void
}

export function ProductsReviewStep({ clientId, onComplete }: Props) {
  const { data: snapshot = [], isLoading } = useGetProductsSnapshotQuery(clientId, {
    pollingInterval: 5000,
  })
  const [completeOnboarding, { isLoading: completing }] = useCompleteOnboardingMutation()

  const total = snapshot.length
  const classified = snapshot.filter((p) => p.tnvedStatus !== null).length
  const needsAttention = snapshot.filter((p) =>
    isNeedsAttention({ tnvedStatus: p.tnvedStatus, countryConflict: p.countryConflict, country: p.country })
  ).length
  const allDone = total > 0 && classified === total && needsAttention === 0

  const handleComplete = async () => {
    await completeOnboarding()
    onComplete()
  }

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Классификация товаров</h2>
        <p className="text-sm text-muted-foreground mt-1">
          ИИ классифицирует ваши товары. Проверьте результаты и исправьте при необходимости.
        </p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Загружаем товары...</p>
      ) : (
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-semibold">{classified}/{total}</p>
            <p className="text-xs text-muted-foreground mt-0.5">Классифицировано</p>
          </div>
          {needsAttention > 0 && (
            <div>
              <p className="text-2xl font-semibold text-yellow-600">{needsAttention}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Требует проверки</p>
            </div>
          )}
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        Полная таблица с фильтрами доступна в разделе «Товары» дашборда.
      </p>

      <Button onClick={handleComplete} disabled={!allDone || completing} className="w-full max-w-xs">
        {completing ? "Сохраняем..." : allDone ? "Готово — перейти в дашборд" : "Дождитесь завершения классификации..."}
      </Button>
    </div>
  )
}
