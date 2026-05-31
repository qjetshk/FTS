"use client"

import { Loader2 } from "lucide-react"
import { useGetFirstOrgQuery } from "@/entities/organization"
import { ProductsTable } from "@/widgets/products-table/ProductsTable"

export default function ProductsPage() {
  const { data: org, isLoading: orgLoading } = useGetFirstOrgQuery()

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const clientId = org?.ozonClientId ?? 0

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-4rem)]">
      <h1 className="text-xl font-semibold text-foreground shrink-0">Товары</h1>
      {clientId ? (
        <div className="flex-1 min-h-0">
          <ProductsTable clientId={clientId} />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Организация не найдена</p>
      )}
    </div>
  )
}
