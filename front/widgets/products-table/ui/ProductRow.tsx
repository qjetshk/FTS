import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui"
import { cn } from "@/shared/lib"
import { type Product, type PendingTnved } from "@/entities/product"
import { CountrySelect } from "@/features/edit-product-country"
import { TnvedReviewPopover } from "@/features/edit-tnved"
import { TCell } from "./TCell"

type Props = {
  product: Product
  clientId: number
  gridCols: string
  variant: "attention" | "main"
  pending?: PendingTnved
  onTnvedSelect: (productId: number, code: string, name: string | null, unit: string | null) => void
  pendingCountry?: string
  onCountrySelect: (productId: number, country: string) => void
}

export function ProductRow({ product, gridCols, variant, pending, onTnvedSelect, pendingCountry, onCountrySelect }: Props) {
  const countryIssue = product.countryConflict || !product.country
  const showTnvedPopup = !!product.tnvedStatus && product.tnvedStatus !== "VERIFIED_BY_USER"

  const effectiveCode = pending?.tnvedCode ?? product.tnvedCode
  const effectiveName = pending ? pending.tnvedName : product.tnvedName
  const tnvedBold = !pending && product.tnvedStatus === "CLASSIFIED"
  const tnvedLabel = effectiveCode ? `${effectiveCode} — ${effectiveName ?? "?"}` : "Нет кода — выбрать"

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
          ? <CountrySelect
              productId={product.productId}
              currentCountry={pendingCountry ?? product.country}
              isPending={!!pendingCountry}
              onSelect={(country) => onCountrySelect(product.productId, country)}
            />
          : <span className="text-xs truncate">{product.country}</span>}
      </div>
      <div className="flex items-center p-2 overflow-hidden font-mono text-muted-foreground text-xs">{product.offerId}</div>
      <div className="flex items-center p-2 overflow-hidden"><span className="text-xs font-mono text-muted-foreground truncate">{product.sku}</span></div>
      <div className="flex items-center p-2 overflow-hidden">
        {showTnvedPopup ? (
          <TooltipProvider>
            <Tooltip>
              <TnvedReviewPopover
                tnvedCode={product.tnvedCode}
                tnvedName={product.tnvedName}
                tnvedUnit={product.tnvedUnit}
                alternatives={product.tnvedAlternatives}
                pendingCode={pending?.tnvedCode}
                pendingName={pending?.tnvedName}
                onSelect={(code, name, unit) => onTnvedSelect(product.productId, code, name, unit)}
              >
                <TooltipTrigger
                  render={<button type="button" />}
                  className={cn(
                    "text-xs hover:underline text-left truncate block w-full",
                    pending ? "text-blue-600 font-medium" : product.tnvedStatus === "NEEDS_REVIEW" ? "text-red-700" : "",
                    tnvedBold && "font-semibold"
                  )}
                >
                  {pending && <span className="inline-block size-1.5 rounded-full bg-blue-500 mr-1 mb-0.5 shrink-0" />}
                  {tnvedLabel}
                </TooltipTrigger>
              </TnvedReviewPopover>
              <TooltipContent side="bottom" className="max-w-sm text-xs whitespace-normal">
                {effectiveCode}{effectiveName && ` — ${effectiveName}`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <TCell value={effectiveCode ? `${effectiveCode}${effectiveName ? ` — ${effectiveName}` : ""}` : null} bold={tnvedBold} />
        )}
      </div>
      <div className="flex items-center p-2 overflow-hidden">
        <span className="text-xs text-muted-foreground">{pending?.tnvedUnit ?? product.tnvedUnit ?? "—"}</span>
      </div>
    </div>
  )
}
