"use client"

import { useState } from "react"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
  Skeleton,
} from "@/shared/ui"
import { useGetProductsQuery, useGetProductsSnapshotQuery, type Product } from "@/entities/product"
import { cn } from "@/shared/lib"
import { CountrySelect } from "@/features/edit-product-country/ui/CountrySelect"
import { TnvedReviewPopover } from "@/features/edit-tnved/ui/TnvedReviewPopover"
import { ChevronLeft, ChevronRight } from "lucide-react"

type Props = {
  clientId: number
}

function ProductRow({ product, clientId }: { product: Product; clientId: number }) {
  const needsReview = product.tnvedStatus === "NEEDS_REVIEW"
  const countryIssue = product.countryConflict || !product.country

  return (
    <TableRow className={cn(needsReview && "bg-yellow-50 hover:bg-yellow-100")}>
      {/* Фото */}
      <TableCell className="w-12 p-2">
        {product.primaryImg ? (
          <img src={product.primaryImg} alt="" className="size-10 object-cover rounded-md" />
        ) : (
          <div className="size-10 rounded-md bg-muted" />
        )}
      </TableCell>

      {/* Название */}
      <TableCell className="min-w-[180px] max-w-[220px]">
        <span className="text-sm line-clamp-2">{product.name}</span>
      </TableCell>

      {/* Категория */}
      <TableCell className="min-w-[120px] max-w-[160px]">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-sm truncate block cursor-default">{product.category}</span>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs text-xs">{product.categoryPath}</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>

      {/* Страна */}
      <TableCell className="min-w-[120px]">
        {countryIssue ? (
          <CountrySelect
            productId={product.productId}
            clientId={clientId}
            countriesOfOrigin={product.countriesOfOrigin}
            currentCountry={product.country}
          />
        ) : (
          <span className="text-sm">{product.country}</span>
        )}
      </TableCell>

      {/* Описание */}
      <TableCell className="min-w-[160px] max-w-[200px]">
        <span className="text-sm text-muted-foreground truncate block">{product.description ?? "—"}</span>
      </TableCell>

      {/* Offer ID */}
      <TableCell className="min-w-[100px]">
        <span className="text-xs font-mono text-muted-foreground">{product.offerId}</span>
      </TableCell>

      {/* SKU */}
      <TableCell className="min-w-[80px]">
        <span className="text-xs font-mono text-muted-foreground">{product.sku}</span>
      </TableCell>

      {/* ТН ВЭД */}
      <TableCell className="min-w-[180px]">
        {needsReview ? (
          <TnvedReviewPopover
            productId={product.productId}
            clientId={clientId}
            tnvedCode={product.tnvedCode}
            tnvedName={product.tnvedName}
            alternatives={product.tnvedAlternatives}
          >
            <button className="text-sm text-yellow-800 hover:underline text-left">
              {product.tnvedCode
                ? `${product.tnvedCode} — ${product.tnvedName ?? "?"}`
                : "Нет кода — нажмите для выбора"}
            </button>
          </TnvedReviewPopover>
        ) : (
          <span className="text-sm">
            {product.tnvedCode
              ? `${product.tnvedCode}${product.tnvedName ? ` — ${product.tnvedName}` : ""}`
              : "—"}
          </span>
        )}
      </TableCell>

      {/* Единица */}
      <TableCell className="min-w-[60px]">
        <span className="text-sm text-muted-foreground">{product.tnvedUnit ?? "—"}</span>
      </TableCell>
    </TableRow>
  )
}

export function ProductsTable({ clientId }: Props) {
  const [page, setPage] = useState(1)
  const limit = 20

  const { data, isLoading } = useGetProductsQuery({ clientId, page, limit })
  const { data: snapshot = [] } = useGetProductsSnapshotQuery(clientId, {
    pollingInterval: 5000,
    skip: !clientId,
  })

  const nullStatuses = snapshot.filter((p) => p.tnvedStatus === null).length
  const classifying = nullStatuses > 0

  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / limit)

  return (
    <div className="flex flex-col gap-3">
      {classifying && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="size-2 rounded-full bg-primary animate-pulse" />
          Классификация идёт: {snapshot.length - nullStatuses}/{snapshot.length} товаров
        </div>
      )}

      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12" />
              <TableHead>Название</TableHead>
              <TableHead>Категория</TableHead>
              <TableHead>Страна</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead>Offer ID</TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>ТН ВЭД</TableHead>
              <TableHead>Ед.</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 9 }).map((_, j) => (
                      <TableCell key={j}><Skeleton className="h-5 w-full" /></TableCell>
                    ))}
                  </TableRow>
                ))
              : (data?.items ?? []).map((product) => (
                  <ProductRow key={product.id} product={product} clientId={clientId} />
                ))}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{total} товаров</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-1 rounded hover:bg-accent disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>
            <span>{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-1 rounded hover:bg-accent disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
