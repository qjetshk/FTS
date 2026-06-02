"use client"

import type { Organization } from "@/entities/organization"
import { OrgForm } from "@/widgets/org-form"

type Props = {
  org: Organization
  onComplete: () => void
}

export function OrgFormStep({ org, onComplete }: Props) {
  return (
    <div className="w-full max-w-xl flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Данные организации</h2>
        <p className="text-sm text-muted-foreground mt-1">Проверьте и заполните недостающие поля</p>
      </div>
      <OrgForm org={org} onSaved={onComplete} />
    </div>
  )
}
