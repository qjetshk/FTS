"use client"

import { AlertTriangle, Loader2, PackageOpen } from "lucide-react"
import { Button } from "@/shared/ui"
import type { ProductsSyncError } from "@/entities/product"

const ERROR_TEXT: Record<ProductsSyncError, string> = {
  ozon_auth:
    "OZON отклонил API-ключ. Проверьте, что ключ действующий и у него есть доступ к товарам. Ключ можно поменять позже в настройках организации.",
  failed: "Не удалось загрузить товары из OZON. Попробуйте ещё раз или продолжите и загрузите товары позже.",
}

type Props =
  | { state: "loading" }
  | { state: "progress"; classified: number; total: number }
  | { state: "empty" }
  | { state: "failed"; error: ProductsSyncError | null; retrying: boolean; onRetry: () => void }

// Что сейчас с товарами организации: грузятся, классифицируются, каталог пуст или синхронизация упала
export function SyncStatusBanner(props: Props) {
  if (props.state === "loading") {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
        <Loader2 className="size-3.5 animate-spin" />
        Загружаем товары из OZON…
      </div>
    )
  }

  if (props.state === "progress") {
    return (
      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground mt-1">
        <span className="size-1.5 rounded-full bg-primary animate-pulse" />
        Идёт классификация: {props.classified}/{props.total}
      </div>
    )
  }

  if (props.state === "empty") {
    return (
      <div className="mx-auto mt-3 flex max-w-xl items-start gap-3 rounded-lg border border-border px-4 py-3 text-left">
        <PackageOpen strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          В каталоге OZON пока нет товаров. Когда они появятся, мы загрузим и классифицируем их сами, проверить можно будет на странице «Товары».
        </p>
      </div>
    )
  }

  return (
    <div className="mx-auto mt-3 flex max-w-xl items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 px-4 py-3 text-left">
      <AlertTriangle strokeWidth={1.5} className="mt-0.5 size-4 shrink-0 text-destructive" />
      <div className="flex flex-col gap-2">
        <p className="text-sm">{ERROR_TEXT[props.error ?? "failed"]}</p>
        <Button variant="outline" size="sm" className="w-fit" onClick={props.onRetry} disabled={props.retrying}>
          {props.retrying ? "Запускаем…" : "Повторить загрузку"}
        </Button>
      </div>
    </div>
  )
}
