"use client"

import { Loader2 } from "lucide-react"
import { useGetFirstOrgQuery } from "@/entities/organization"
import { useGetProductsQuery } from "@/entities/product"
import { ProductsAttention } from "@/widgets/products-attention/ProductsAttention"
import { ProductsTable } from "@/widgets/products-table/ProductsTable"

export default function ProductsPage() {
  const { data: org, isLoading: orgLoading } = useGetFirstOrgQuery()

  const clientId = org?.ozonClientId ?? 0

  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery(
    { clientId, page: 1, limit: 100 },
    { skip: !clientId }
  )

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-semibold text-foreground">Товары</h1>

      {!productsLoading && productsData && (
        <ProductsAttention products={productsData.items} clientId={clientId} />
      )}

      {clientId ? (
        <ProductsTable clientId={clientId} />
      ) : (
        <p className="text-sm text-muted-foreground">Организация не найдена</p>
      )}
    </div>
  )
}
