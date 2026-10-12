import type { KeyboardEvent } from "react"
import { getCoreRowModel, useReactTable, type Column, type ColumnSizingState, type OnChangeFn } from "@tanstack/react-table"
import { Skeleton } from "@/shared/ui"
import { cn } from "@/shared/lib"
import { type Product, type PendingTnved } from "@/entities/product"
import { COLUMNS } from "../config/table.config"
import { ProductRow } from "./ProductRow"

const KEY_STEP = 16

type Props = {
  items: Product[]
  clientId: number
  isLoading?: boolean
  variant: "attention" | "main"
  label?: string
  maxHeight?: number
  flex?: boolean
  columnSizing: ColumnSizingState
  onColumnSizingChange: OnChangeFn<ColumnSizingState>
  pendingTnvedMap: Record<number, PendingTnved>
  onTnvedSelect: (productId: number, code: string, name: string | null, unit: string | null) => void
  pendingCountryMap: Record<number, string>
  onCountrySelect: (productId: number, country: string) => void
}

export function TableBlock({ items, clientId, isLoading, variant, label, maxHeight, flex, columnSizing, onColumnSizingChange, pendingTnvedMap, onTnvedSelect, pendingCountryMap, onCountrySelect }: Props) {
  const table = useReactTable({
    data: items,
    columns: COLUMNS,
    getCoreRowModel: getCoreRowModel(),
    columnResizeMode: "onChange",
    state: { columnSizing },
    onColumnSizingChange,
  })

  // клавиатурное изменение ширины: ← → по KEY_STEP px с учётом minSize, Home — исходная ширина
  const resizeByKey = (e: KeyboardEvent<HTMLDivElement>, column: Column<Product>) => {
    if (e.key === "Home") {
      e.preventDefault()
      column.resetSize()
      return
    }
    const delta = e.key === "ArrowRight" ? KEY_STEP : e.key === "ArrowLeft" ? -KEY_STEP : 0
    if (!delta) return
    e.preventDefault()
    const size = Math.max(column.columnDef.minSize ?? 0, column.getSize() + delta)
    table.setColumnSizing((prev) => ({ ...prev, [column.id]: size }))
  }

  // fixed px columns + trailing 1fr filler so the table stretches on wide screens and scrolls on narrow ones
  const gridCols = [...table.getVisibleLeafColumns().map(c => `${c.getSize()}px`), "1fr"].join(" ")
  const headers = table.getHeaderGroups()[0].headers

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
        className={cn("overflow-auto rounded-xl border", borderCls)}
        style={maxHeight ? { maxHeight } : flex ? { flex: 1, minHeight: 0 } : undefined}
      >
        <div className="w-max min-w-full">
          <div className={cn("sticky top-0 z-10 grid h-9 border-b", headBg, borderCls)} style={{ gridTemplateColumns: gridCols }}>
            {headers.map((header, i) => (
              <div key={header.id} className="group relative flex items-center px-2 overflow-hidden">
                <span className={cn("text-xs font-medium truncate select-none", headText)}>
                  {header.column.columnDef.header as string}
                </span>
                {header.column.getCanResize() && i < headers.length - 1 && (
                  <div
                    role="separator"
                    aria-orientation="vertical"
                    aria-label={`Ширина колонки «${header.column.columnDef.header as string}»: стрелки ← →, Home — сброс`}
                    aria-valuenow={header.column.getSize()}
                    tabIndex={0}
                    onKeyDown={(e) => resizeByKey(e, header.column)}
                    onMouseDown={header.getResizeHandler()}
                    onTouchStart={header.getResizeHandler()}
                    onDoubleClick={() => header.column.resetSize()}
                    className="absolute right-0 top-0 flex h-full w-3 cursor-col-resize touch-none select-none justify-end"
                  >
                    <div className={cn(
                      "my-2 w-0.5 rounded-full bg-border group-hover:bg-primary/60",
                      header.column.getIsResizing() && "bg-primary group-hover:bg-primary"
                    )} />
                  </div>
                )}
              </div>
            ))}
          </div>
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-row-${i}`} className="grid border-b border-border/50" style={{ gridTemplateColumns: gridCols }}>
                  {COLUMNS.map(c => <div key={`skeleton-col-${c.id}`} className="p-2"><Skeleton className="h-4 w-full" /></div>)}
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
