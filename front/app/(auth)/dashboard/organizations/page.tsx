"use client"

import * as React from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { CheckCircle2, XCircle, Loader2, Eye, EyeOff, RefreshCw } from "lucide-react"
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
  Card, CardContent,
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  Button, Input,
  FieldReadonly,
} from "@/shared/ui"
import {
  useGetFirstOrgQuery,
  useGetOrgByIdQuery,
  useValidateApiKeyQuery,
  useUpdateOrganizationMutation,
  isIp,
} from "@/entities/organization"
import { OrgForm } from "@/widgets/org-form"

// ─── Section 1: API Integration ───────────────────────────────────────────────

const apiKeySchema = z.object({
  ozonApiKey: z.string().trim().min(1, "Введите API-ключ"),
})
type ApiKeyValues = z.infer<typeof apiKeySchema>

function ApiIntegrationSection({ orgId, currentApiKey, clientId, userId }: {
  orgId: string
  currentApiKey: string
  clientId: number
  userId: string
}) {
  const [showKey, setShowKey] = React.useState(false)
  const [updateOrg, { isLoading }] = useUpdateOrganizationMutation()

  const {
    data: validationResult,
    isLoading: validating,
    isFetching: revalidating,
    refetch,
  } = useValidateApiKeyQuery(undefined, { refetchOnMountOrArgChange: true })

  const form = useForm<ApiKeyValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: { ozonApiKey: currentApiKey },
  })

  const isDirty = form.formState.isDirty

  const onSubmit = async (values: ApiKeyValues) => {
    try {
      await updateOrg({ id: orgId, ozonApiKey: values.ozonApiKey }).unwrap()
      toast.success("API-ключ обновлён")
      form.reset({ ozonApiKey: values.ozonApiKey })
      // Перепроверяем ключ после сохранения
      setTimeout(() => refetch(), 400)
    } catch {
      toast.error("Не удалось обновить ключ")
    }
  }

  const statusBadge = () => {
    if (validating || revalidating) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" /> Проверяем...
        </span>
      )
    }
    if (!validationResult) return null
    if (validationResult.valid) {
      return (
        <span className="flex items-center gap-1.5 text-xs text-green-600">
          <CheckCircle2 className="size-3.5" /> Ключ действителен
        </span>
      )
    }
    return (
      <span className="flex items-center gap-1.5 text-xs text-destructive">
        <XCircle className="size-3.5" /> {validationResult.error ?? "Ключ недействителен"}
      </span>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 pt-1">
        <div className="grid grid-cols-2 gap-3">
          {/* userId */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">User ID</span>
            <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted text-sm text-muted-foreground font-mono truncate">
              {userId}
            </div>
          </div>
          {/* clientId */}
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Client ID</span>
            <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted text-sm text-muted-foreground">
              {clientId}
            </div>
          </div>
        </div>

        {/* API Key */}
        <FormField control={form.control} name="ozonApiKey" render={({ field }) => (
          <FormItem>
            <div className="flex items-center justify-between">
              <FormLabel>API-ключ OZON</FormLabel>
              {!isDirty && statusBadge()}
              {isDirty && (
                <span className="text-xs text-warning-fg">Сохраните, чтобы проверить новый ключ</span>
              )}
            </div>
            <div className="flex gap-2">
              <FormControl>
                <div className="relative flex-1">
                  <Input
                    {...field}
                    type={showKey ? "text" : "password"}
                    className={
                      !isDirty && validationResult && !validationResult.valid
                        ? "border-destructive pr-9"
                        : "pr-9"
                    }
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowKey((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showKey ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </FormControl>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => refetch()}
                disabled={validating || revalidating || isDirty}
                title="Проверить снова"
              >
                <RefreshCw className={`size-4 ${revalidating ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <FormMessage />
          </FormItem>
        )} />

        <Button type="submit" disabled={!isDirty || isLoading} className="w-full">
          {isLoading ? "Сохраняем..." : "Сохранить ключ"}
        </Button>
      </form>
    </Form>
  )
}

// ─── Section 2: Org Details ───────────────────────────────────────────────────


const addressSchema = z.object({
  street: z.string().trim().optional(),
  house: z.string().trim().optional(),
  room: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
})
type AddressValues = z.infer<typeof addressSchema>

function OrgDetailsSection({ org }: { org: NonNullable<ReturnType<typeof useGetFirstOrgQuery>["data"]> }) {
  const ip = isIp(org)

  const [updateOrg, { isLoading }] = useUpdateOrganizationMutation()

  const form = useForm<AddressValues>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      street: org.street ?? "",
      house: org.house ?? "",
      room: org.room ?? "",
      postalCode: org.postalCode ?? "",
    },
  })

  const onSubmit = async (values: AddressValues) => {
    const street = ip ? values.street : (org.street ?? undefined)
    const house = ip ? values.house : (org.house ?? undefined)
    const room = ip ? (values.room || undefined) : (org.room ?? undefined)
    const postalCode = ip ? values.postalCode : org.postalCode

    const fullAddress = [postalCode, org.country, org.region, org.city, street, house, room]
      .filter(Boolean).join(", ")

    try {
      await updateOrg({ id: org.id, fullAddress, country: org.country, region: org.region, city: org.city, street, house, room, postalCode }).unwrap()
      toast.success("Адрес обновлён")
      form.reset(values)
    } catch {
      toast.error("Ошибка при сохранении")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6 pt-1">

        {/* Реквизиты */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Реквизиты</h3>
          <div className="grid grid-cols-2 gap-3">
            <FieldReadonly label="Полное название" value={org.fullOrg} />
            <FieldReadonly label="ОПФ" value={org.fullOpf} />
            <FieldReadonly label="ИНН" value={org.inn} />
            <FieldReadonly label="ОГРН" value={org.ogrn} />
            {org.kpp && <FieldReadonly label="КПП" value={org.kpp} />}
            <FieldReadonly label="ОКАТО" value={org.okato5} />
          </div>
        </section>

        {/* Адрес */}
        <section className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Адрес</h3>
          <div className="grid grid-cols-2 gap-3">
            <FieldReadonly label="Страна" value={org.country} />
            <FieldReadonly label="Регион" value={org.region} />
            <FieldReadonly label="Город" value={org.city} />
            {ip ? (
              <>
                <FormField control={form.control} name="postalCode" render={({ field }) => (
                  <FormItem><FormLabel>Индекс</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                {(["street", "house", "room"] as const).map((f) => (
                  <FormField key={f} control={form.control} name={f} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{{ street: "Улица", house: "Дом", room: "Офис/кв." }[f]}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))}
              </>
            ) : (
              <>
                <FieldReadonly label="Индекс" value={org.postalCode} />
                <FieldReadonly label="Улица" value={org.street} />
                <FieldReadonly label="Дом" value={org.house} />
                <FieldReadonly label="Офис/кв." value={org.room} />
              </>
            )}
          </div>
        </section>

        {ip && (
          <Button type="submit" disabled={!form.formState.isDirty || isLoading} className="w-full">
            {isLoading ? "Сохраняем..." : "Сохранить адрес"}
          </Button>
        )}
      </form>
    </Form>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

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

      {/* Шапка */}
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

      {/* Аккордеон */}
      <Accordion type={"single" as const} className="flex flex-col gap-3">

        <AccordionItem value="api" className="border border-border rounded-lg overflow-hidden px-4">
          <AccordionTrigger className="text-sm font-medium py-4">
            Интеграция OZON
          </AccordionTrigger>
          <AccordionContent className="pb-5">
            <ApiIntegrationSection
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
            <OrgDetailsSection org={org} />
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
