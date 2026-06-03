"use client"

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Loader2 } from "lucide-react"
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Card, CardContent,
} from "@/shared/ui"
import { useGetFirstOrgQuery, useGetOrgByIdQuery } from "@/entities/organization"
import { ApiKeyForm } from "@/features/edit-org-api-key"
import { OrgDetailsForm } from "@/features/edit-org-address"
import { OrgForm } from "@/widgets/org-form"

function OrganizationsPageContent() {
  const searchParams = useSearchParams()
  const orgId = searchParams?.get("orgId") ?? undefined

  const firstOrgResult = useGetFirstOrgQuery(undefined, { skip: !!orgId })
  const byIdResult = useGetOrgByIdQuery(orgId!, { skip: !orgId })

  const { data: org, isLoading } = orgId ? byIdResult : firstOrgResult

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!org) return null

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      <Card>
        <CardContent className="pt-5 pb-5 flex flex-col gap-1">
          <h1 className="text-lg font-semibold text-foreground">{org.fullOrg}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span>ИНН: <span className="font-mono text-foreground">{org.inn}</span></span>
            <span>ОГРН: <span className="font-mono text-foreground">{org.ogrn}</span></span>
            {org.kpp && <span>КПП: <span className="font-mono text-foreground">{org.kpp}</span></span>}
          </div>
        </CardContent>
      </Card>

      <Accordion className="flex flex-col gap-3">

        <AccordionItem value="api" className="border border-border rounded-lg overflow-hidden px-4">
          <AccordionTrigger className="text-sm font-medium py-4">
            Интеграция OZON
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <ApiKeyForm
              orgId={org.id}
              currentApiKey={org.ozonApiKey}
              clientId={org.ozonClientId}
              userId={org.userId}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="details" className="border border-border rounded-lg overflow-hidden px-4">
          <AccordionTrigger className="text-sm font-medium py-4">
            Данные организации
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <OrgDetailsForm org={org} />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="declarant" className="border border-border rounded-lg overflow-hidden px-4">
          <AccordionTrigger className="text-sm font-medium py-4">
            Декларант и документ
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <OrgForm org={org} />
          </AccordionContent>
        </AccordionItem>

      </Accordion>
    </div>
  )
}

export default function OrganizationsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    }>
      <OrganizationsPageContent />
    </Suspense>
  )
}
