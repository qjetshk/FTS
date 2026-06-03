import { useState } from "react"
import type { ReactNode } from "react"
import { Group, Panel, Separator } from "react-resizable-panels"
import { Skeleton } from "@/shared/ui"
import { cn } from "@/shared/lib"
import { type Product, type PendingTnved } from "@/entities/product"
import { HEADS, DEFAULT_SIZES, MIN_SIZES } from "../config/table.config"
import { ProductRow } from "./ProductRow"

type Props = {
  items: Product[]
  clientId: number
  isLoading?: boolean
  variant: "attention" | "main"
  label?: string
  maxHeight?: number
  flex?: boolean
  pendingTnvedMap: Record<number, PendingTnved>
  onTnvedSelect: (productId: number, code: string, name: string | null, unit: string | null) => void
  pendingCountryMap: Record<number, string>
  onCountrySelect: (productId: number, country: string) => void
}

export function TableBlock({ items, clientId, isLoading, variant, label, maxHeight, flex, pendingTnvedMap, onTnvedSelect, pendingCountryMap, onCountrySelect }: Props) {
  const [sizes, setSizes] = useState(DEFAULT_SIZES)
  const gridCols = sizes.map(s => `${s}fr`).join(" ")

  const handleLayoutChange = (layout: Record<string, number>) => {
    const arr = HEADS.map((_, i) => layout[`col-${i}`] ?? sizes[i])
    if (arr.some(v => v !== undefined)) setSizes(arr)
  }

  const borderCls = variant === "attention" ? "border-red-200" : "border-border"
  const headBg = variant === "attention" ? "bg-red-50" : "bg-background"
  const headText = variant === "attention" ? "text-red-800" : "text-muted-foreground"

  return (
    <div className={cn("flex flex-col gap-1", flex ? "flex-1 min-h-0" : "shrink-0")}>
      {label && (
        <p className={cn("text-xs font-medium px-0.5", variant === "attention" ? "text-red-700" : "text-muted-foreground")}>
          {label}
        </p>
      )}
      <div
        className={cn("overflow-x-auto overflow-y-auto rounded-xl border", borderCls)}
        style={maxHeight ? { maxHeight } : flex ? { flex: 1, minHeight: 0 } : undefined}
      >
        <div className="min-w-175">
          <div className={cn("sticky top-0 z-10 border-b", headBg, borderCls)}>
            <Group orientation="horizontal" onLayoutChange={handleLayoutChange} style={{ display: "flex", height: 36 }}>
              {HEADS.flatMap((h, i) => {
                const nodes: ReactNode[] = []
                if (i > 0) nodes.push(
                  <Separator key={`sep-${HEADS[i] || "img"}`}
                    className="w-1 cursor-col-resize bg-border/60 hover:bg-primary active:bg-primary transition-colors shrink-0" />
                )
                nodes.push(
                  <Panel key={`panel-${HEADS[i] || "img"}`} id={`col-${i}`} defaultSize={DEFAULT_SIZES[i]} minSize={MIN_SIZES[i]}
                    className="flex items-center px-2 overflow-hidden">
                    <span className={cn("text-xs font-medium truncate select-none", headText)}>{h}</span>
                  </Panel>
                )
                return nodes
              })}
            </Group>
          </div>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-row-${i}`} className="grid border-b border-border/50" style={{ gridTemplateColumns: gridCols }}>
                  {HEADS.map((h, j) => <div key={`skeleton-col-${h || j}`} className="p-2"><Skeleton className="h-4 w-full" /></div>)}
                </div>
              ))
            : items.map(p => (
                <ProductRow
                  key={p.id}
                  product={p}
                  clientId={clientId}
                  gridCols={gridCols}
                  variant={variant}
                  pending={pendingTnvedMap[p.productId]}
                  onTnvedSelect={onTnvedSelect}
                  pendingCountry={pendingCountryMap[p.productId]}
                  onCountrySelect={onCountrySelect}
                />
              ))
          }
        </div>
      </div>
    </div>
  )
}
