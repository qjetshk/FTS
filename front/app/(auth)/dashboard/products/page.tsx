"use client"

import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Loader2, Save } from "lucide-react"
import { Button } from "@/shared/ui"
import { useGetFirstOrgQuery, useGetOrgByIdQuery } from "@/entities/organization"
import { useUpdateTnvedMutation, useUpdateCountryMutation } from "@/entities/product"
import { ProductsTable, type PendingTnved } from "@/widgets/products-table/ProductsTable"

function ProductsPageContent() {
  const searchParams = useSearchParams()
  const orgId = searchParams?.get("orgId") ?? undefined

  const firstOrgResult = useGetFirstOrgQuery(undefined, { skip: !!orgId })
  const byIdResult = useGetOrgByIdQuery(orgId!, { skip: !orgId })
  const { data: org, isLoading: orgLoading } = orgId ? byIdResult : firstOrgResult

  const [pendingTnved, setPendingTnved] = useState<Record<number, PendingTnved>>({})
  const [pendingCountry, setPendingCountry] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const [updateTnved] = useUpdateTnvedMutation()
  const [updateCountry] = useUpdateCountryMutation()

  const clientId = org?.ozonClientId ?? 0

  const hasPending = Object.keys(pendingTnved).length > 0 || Object.keys(pendingCountry).length > 0

  const handleTnvedSelect = (productId: number, code: string, name: string | null, unit: string | null) => {
    setPendingTnved(prev => ({ ...prev, [productId]: { tnvedCode: code, tnvedName: name, tnvedUnit: unit } }))
  }

  const handleCountrySelect = (productId: number, country: string) => {
    setPendingCountry(prev => ({ ...prev, [productId]: country }))
  }

  const handleSave = async () => {
    if (!clientId) return
    setIsSaving(true)
    try {
      await Promise.all([
        ...Object.entries(pendingTnved).map(([productId, p]) =>
          updateTnved({
            productId: Number(productId),
            clientId,
            tnvedCode: p.tnvedCode,
            tnvedName: p.tnvedName,
            tnvedUnit: p.tnvedUnit,
            tnvedStatus: "VERIFIED_BY_USER",
            tnvedAlternatives: [],
          }).unwrap()
        ),
        ...Object.entries(pendingCountry).map(([productId, country]) =>
          updateCountry({
            productId: Number(productId),
            clientId,
            country,
          }).unwrap()
        ),
      ])
      setPendingTnved({})
      setPendingCountry({})
      toast.success("Изменения сохранены")
    } catch {
      toast.error("Не удалось сохранить изменения")
    } finally {
      setIsSaving(false)
    }
  }

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
        {hasPending && (
          <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-2">
            {isSaving
              ? <Loader2 className="size-3.5 animate-spin" />
              : <Save className="size-3.5" />
            }
            {isSaving ? "Сохраняем..." : "Сохранить изменения"}
          </Button>
        )}
      </div>

      {clientId ? (
        <div className="flex-1 min-h-0">
          <ProductsTable
            clientId={clientId}
            pendingTnvedMap={pendingTnved}
            onTnvedSelect={handleTnvedSelect}
            pendingCountryMap={pendingCountry}
            onCountrySelect={handleCountrySelect}
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
