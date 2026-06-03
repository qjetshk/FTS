"use client"

import { useState } from "react"
import { Button } from "@/shared/ui"
import { useGetProductsQuery, useGetProductsSnapshotQuery, isNeedsAttention, type PendingTnved } from "@/entities/product"
import { cn } from "@/shared/lib"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { MAIN_LIMIT } from "./config/table.config"
import { TableBlock } from "./ui/TableBlock"

type Props = {
  clientId: number
  className?: string
  showClassificationProgress?: boolean
  pendingTnvedMap?: Record<number, PendingTnved>
  onTnvedSelect?: (productId: number, code: string, name: string | null, unit: string | null) => void
  pendingCountryMap?: Record<number, string>
  onCountrySelect?: (productId: number, country: string) => void
}

const EMPTY_PENDING_TNVED: Record<number, PendingTnved> = {}
const EMPTY_PENDING_COUNTRY: Record<number, string> = {}
const NOOP = () => {}

export function ProductsTable({ clientId, className, showClassificationProgress = false, pendingTnvedMap = EMPTY_PENDING_TNVED, onTnvedSelect = NOOP, pendingCountryMap = EMPTY_PENDING_COUNTRY, onCountrySelect = NOOP }: Props) {
  const [mainPage, setMainPage] = useState(1)

  const { data, isLoading } = useGetProductsQuery({ clientId, page: 1, limit: 100 })
  const { data: snapshot = [] } = useGetProductsSnapshotQuery(clientId, {
    pollingInterval: showClassificationProgress ? 5000 : 0,
    skip: !clientId || !showClassificationProgress,
  })

  const allItems = data?.items ?? []
  const badItems = allItems.filter(p => isNeedsAttention({ tnvedStatus: p.tnvedStatus, countryConflict: p.countryConflict, country: p.country }))
  const goodItems = allItems.filter(p => !isNeedsAttention({ tnvedStatus: p.tnvedStatus, countryConflict: p.countryConflict, country: p.country }))
  const totalGoodPages = Math.ceil(goodItems.length / MAIN_LIMIT)
  const pageItems = goodItems.slice((mainPage - 1) * MAIN_LIMIT, mainPage * MAIN_LIMIT)
  const nullCount = snapshot.filter(p => p.tnvedStatus === null).length
  const hasBad = isLoading || badItems.length > 0
  const attentionMaxH = isLoading ? 150 : Math.min(badItems.length * 42 + 40, 250)

  return (
    <div className={cn("flex flex-col justify-end gap-3 h-full", className)}>
      {showClassificationProgress && nullCount > 0 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Классификация: {snapshot.length - nullCount}/{snapshot.length}
        </div>
      )}

      {hasBad && (
        <TableBlock
          items={badItems}
          clientId={clientId}
          isLoading={isLoading}
          variant="attention"
          label={isLoading ? undefined : `Требует внимания — ${badItems.length}`}
          maxHeight={attentionMaxH}
          pendingTnvedMap={pendingTnvedMap}
          onTnvedSelect={onTnvedSelect}
          pendingCountryMap={pendingCountryMap}
          onCountrySelect={onCountrySelect}
        />
      )}

      <TableBlock
        items={pageItems}
        clientId={clientId}
        isLoading={isLoading}
        variant="main"
        label={(!isLoading && hasBad && goodItems.length > 0) ? `Товары — ${goodItems.length}` : undefined}
        flex
        pendingTnvedMap={pendingTnvedMap}
        onTnvedSelect={onTnvedSelect}
        pendingCountryMap={pendingCountryMap}
        onCountrySelect={onCountrySelect}
      />

      {totalGoodPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <span>{goodItems.length} товаров</span>
          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon-xs" onClick={() => setMainPage(p => Math.max(1, p - 1))} disabled={mainPage === 1}><ChevronLeft className="size-3.5" /></Button>
            <span>{mainPage} / {totalGoodPages}</span>
            <Button variant="ghost" size="icon-xs" onClick={() => setMainPage(p => Math.min(totalGoodPages, p + 1))} disabled={mainPage === totalGoodPages}><ChevronRight className="size-3.5" /></Button>
          </div>
        </div>
      )}
    </div>
  )
}
