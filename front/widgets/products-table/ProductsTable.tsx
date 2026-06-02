"use client"

import { useState } from "react"
import { Group, Panel, Separator } from "react-resizable-panels"
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Skeleton,
} from "@/shared/ui"
import { useGetProductsQuery, useGetProductsSnapshotQuery, isNeedsAttention, type Product } from "@/entities/product"
import { cn } from "@/shared/lib"
import { CountrySelect } from "@/features/edit-product-country/ui/CountrySelect"
import { TnvedReviewPopover } from "@/features/edit-tnved/ui/TnvedReviewPopover"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = { clientId: number; className?: string }

const HEADS = ["", "Название", "Категория", "Страна-изготовитель", "Артикул", "SKU", "ТН ВЭД", "Ед."]
const DEFAULT_SIZES = [4, 18, 13, 13, 11, 7, 28, 6]
const MIN_SIZES =     [3,  8,   6,   6,   5,  3,  8,   3]
const MAIN_LIMIT = 15

function TCell({ value, mono, bold, muted }: { value?: string | null; mono?: boolean; bold?: boolean; muted?: boolean }) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span />} className={cn("text-xs truncate block cursor-default w-full", mono && "font-mono", bold && "font-semibold", muted && "text-muted-foreground")}>
          {value}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm text-xs whitespace-normal">{value}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

function Row({ product, clientId, gridCols, variant }: {
  product: Product; clientId: number; gridCols: string; variant: "attention" | "main"
}) {
  const countryIssue = product.countryConflict || !product.country
  const showTnvedPopup = !!product.tnvedStatus && product.tnvedStatus !== "VERIFIED_BY_USER"
  const tnvedBold = product.tnvedStatus === "CLASSIFIED"
  const tnvedLabel = product.tnvedCode ? `${product.tnvedCode} — ${product.tnvedName ?? "?"}` : "Нет кода — выбрать"
  const rowCls = variant === "attention" ? "bg-red-50 hover:bg-red-100"
    : product.tnvedStatus === "VERIFIED_BY_LLM" ? "bg-green-50 hover:bg-green-100"
    : product.tnvedStatus === "CLASSIFIED" ? "bg-yellow-50 hover:bg-yellow-100"
    : "hover:bg-muted/40"

  return (
    <div className={cn("grid border-b border-border/50 last:border-b-0", rowCls)} style={{ gridTemplateColumns: gridCols }}>
      <div className="flex items-center p-1.5 overflow-hidden">
        {product.primaryImg ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger render={<span />}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.primaryImg} alt="" className="size-8 object-cover rounded shrink-0 cursor-zoom-in" />
              </TooltipTrigger>
              <TooltipContent side="right" className="p-1 bg-background border shadow-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={product.primaryImg} alt="" className="size-40 object-contain rounded" />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <div className="size-8 rounded bg-muted shrink-0" />
        )}
      </div>
      <div className="flex items-center p-2 overflow-hidden"><TCell value={product.name} /></div>
      <div className="flex items-center p-2 overflow-hidden">
        <TooltipProvider><Tooltip>
          <TooltipTrigger render={<span />} className="text-xs truncate block cursor-default w-full">{product.category}</TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-sm text-xs whitespace-normal">{product.categoryPath}</TooltipContent>
        </Tooltip></TooltipProvider>
      </div>
      <div className="flex items-center p-2 overflow-hidden">
        {countryIssue
          ? <CountrySelect productId={product.productId} clientId={clientId} countriesOfOrigin={product.countriesOfOrigin} currentCountry={product.country} />
          : <span className="text-xs truncate">{product.country}</span>}
      </div>
      <div className="flex items-center p-2 overflow-hidden font-mono text-muted-foreground text-xs">{product.offerId}</div>
      <div className="flex items-center p-2 overflow-hidden"><span className="text-xs font-mono text-muted-foreground truncate">{product.sku}</span></div>
      <div className="flex items-center p-2 overflow-hidden">
        {showTnvedPopup ? (
          <TnvedReviewPopover productId={product.productId} clientId={clientId} tnvedCode={product.tnvedCode} tnvedName={product.tnvedName} alternatives={product.tnvedAlternatives}>
            <button type="button" className={cn("text-xs hover:underline text-left truncate block w-full", product.tnvedStatus === "NEEDS_REVIEW" && "text-red-700", tnvedBold && "font-semibold")}>
              {tnvedLabel}
            </button>
          </TnvedReviewPopover>
        ) : (
          <TCell value={product.tnvedCode ? `${product.tnvedCode}${product.tnvedName ? ` — ${product.tnvedName}` : ""}` : null} bold={tnvedBold} />
        )}
      </div>
      <div className="flex items-center p-2 overflow-hidden"><span className="text-xs text-muted-foreground">{product.tnvedUnit ?? "—"}</span></div>
    </div>
  )
}

// ─── Self-contained table block with own resize state ─────────────────────────

function TableBlock({ items, clientId, isLoading, variant, label, maxHeight, flex }: {
  items: Product[]; clientId: number
  isLoading?: boolean; variant: "attention" | "main"
  label?: string; maxHeight?: number; flex?: boolean
}) {
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
          {/* Sticky header with own Group */}
          <div className={cn("sticky top-0 z-10 border-b", headBg, borderCls)}>
            <Group orientation="horizontal" onLayoutChange={handleLayoutChange} style={{ display: "flex", height: 36 }}>
              {HEADS.flatMap((h, i) => {
                const nodes: React.ReactNode[] = []
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

          {/* Body */}
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={`skeleton-row-${i}`} className="grid border-b border-border/50" style={{ gridTemplateColumns: gridCols }}>
                  {HEADS.map((_, j) => <div key={`skeleton-col-${j}`} className="p-2"><Skeleton className="h-4 w-full" /></div>)}
                </div>
              ))
            : items.map(p => <Row key={p.id} product={p} clientId={clientId} gridCols={gridCols} variant={variant} />)
          }
        </div>
      </div>
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function ProductsTable({ clientId, className }: Props) {
  const [mainPage, setMainPage] = useState(1)

  const { data, isLoading } = useGetProductsQuery({ clientId, page: 1, limit: 100 })
  const { data: snapshot = [] } = useGetProductsSnapshotQuery(clientId, { pollingInterval: 5000, skip: !clientId })

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
      {nullCount > 0 && (
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
        />
      )}

      <TableBlock
        items={pageItems}
        clientId={clientId}
        isLoading={isLoading}
        variant="main"
        label={(!isLoading && hasBad && goodItems.length > 0) ? `Товары — ${goodItems.length}` : undefined}
        flex
      />

      {totalGoodPages > 1 && (
        <div className="flex items-center justify-between text-xs text-muted-foreground shrink-0">
          <span>{goodItems.length} товаров</span>
          <div className="flex items-center gap-1.5">
            <button type="button" onClick={() => setMainPage(p => Math.max(1, p - 1))} disabled={mainPage === 1} className="p-1 rounded hover:bg-accent disabled:opacity-40"><ChevronLeft className="size-3.5" /></button>
            <span>{mainPage} / {totalGoodPages}</span>
            <button type="button" onClick={() => setMainPage(p => Math.min(totalGoodPages, p + 1))} disabled={mainPage === totalGoodPages} className="p-1 rounded hover:bg-accent disabled:opacity-40"><ChevronRight className="size-3.5" /></button>
          </div>
        </div>
      )}
    </div>
  )
}
