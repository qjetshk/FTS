"use client"

import { Loader2, Save } from "lucide-react"
import { Button } from "@/shared/ui"

type Props = {
  hasPending: boolean
  isSaving: boolean
  onSave: () => void
}

export function SaveChangesButton({ hasPending, isSaving, onSave }: Props) {
  if (!hasPending) return null

  return (
    <Button onClick={onSave} disabled={isSaving} size="sm" className="gap-2">
      {isSaving
        ? <Loader2 className="size-3.5 animate-spin" />
        : <Save className="size-3.5" />
      }
      {isSaving ? "Сохраняем..." : "Сохранить изменения"}
    </Button>
  )
}
