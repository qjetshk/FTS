"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useGetFirstOrgQuery, useGetOrgByIdQuery } from "@/entities/organization"
import { useProductChanges, SaveChangesButton } from "@/features/save-product-changes"
import { ProductsTable } from "@/widgets/products-table"

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const orgId = searchParams?.get("orgId") ?? undefined

  const firstOrgResult = useGetFirstOrgQuery(undefined, { skip: !!orgId })
  const byIdResult = useGetOrgByIdQuery(orgId!, { skip: !orgId })
  const { data: org, isLoading: orgLoading } = orgId ? byIdResult : firstOrgResult

  const clientId = org?.ozonClientId ?? 0
  const changes = useProductChanges(clientId)

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3 h-[calc(100vh-4rem)]">

      <div className="flex items-center justify-between shrink-0">
        <h1 className="text-xl font-semibold text-foreground">Товары</h1>
        <SaveChangesButton
          hasPending={changes.hasPending}
          isSaving={changes.isSaving}
          onSave={changes.handleSave}
        />
      </div>

      {clientId ? (
        <div className="flex-1 min-h-0">
          <ProductsTable
            clientId={clientId}
            pendingTnvedMap={changes.pendingTnved}
            onTnvedSelect={changes.handleTnvedSelect}
            pendingCountryMap={changes.pendingCountry}
            onCountrySelect={changes.handleCountrySelect}
          />
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Организация не найдена</p>
      )}

    </div>
  )
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  )
}
