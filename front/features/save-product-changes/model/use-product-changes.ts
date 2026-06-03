import { useState } from "react"
import { toast } from "sonner"
import { useUpdateTnvedMutation, useUpdateCountryMutation, type PendingTnved } from "@/entities/product"

export function useProductChanges(clientId: number) {
  const [pendingTnved, setPendingTnved] = useState<Record<number, PendingTnved>>({})
  const [pendingCountry, setPendingCountry] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)

  const [updateTnved] = useUpdateTnvedMutation()
  const [updateCountry] = useUpdateCountryMutation()

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
          updateCountry({ productId: Number(productId), clientId, country }).unwrap()
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

  return { pendingTnved, pendingCountry, hasPending, isSaving, handleTnvedSelect, handleCountrySelect, handleSave }
}
