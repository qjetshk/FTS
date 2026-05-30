"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  Button, Input,
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/ui"
import {
  useUpdateOrganizationMutation,
  useUpdateDeclarantMutation,
  useCreateDocumentMutation,
  DOCUMENT_TYPES,
  type Organization,
} from "@/entities/organization"
import { orgFormSchema, type OrgFormValues } from "../model/org-form.schema"

type Props = {
  org: Organization
  onComplete: () => void
}

function DisabledField({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted text-sm text-muted-foreground">
        {value || "—"}
      </div>
    </div>
  )
}

export function OrgFormStep({ org, onComplete }: Props) {
  const isIp = org.fullOpf.toLowerCase().includes("индивидуальный предприниматель") ||
    org.fullOpf.toLowerCase().includes(" ип") ||
    org.fullOpf.startsWith("ИП")

  const [updateOrg] = useUpdateOrganizationMutation()
  const [updateDeclarant] = useUpdateDeclarantMutation()
  const [createDocument, { isLoading }] = useCreateDocumentMutation()

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
      fullAddress: org.house ? "" : "",
      country: org.country,
      region: org.region,
      city: org.city,
      street: org.street ?? "",
      house: org.house ?? "",
      room: org.room ?? "",
      postalCode: org.postalCode,
      declarantName: org.declarant?.name ?? "",
      declarantSurname: org.declarant?.surname ?? "",
      declarantPatronymic: org.declarant?.patronymic ?? "",
      declarantPosition: org.declarant?.position ?? "",
      declarantEmail: org.declarant?.email ?? "",
      declarantPhone: org.declarant?.phone ?? "",
      docTypeCode: "",
      docTypeShort: "",
      docSeries: "",
      docNumber: "",
      docIssuedBy: "",
      docIssuedAt: "",
    },
  })

  const selectedTypeCode = form.watch("docTypeCode")

  const onSubmit = async (values: OrgFormValues) => {
    if (!org.declarant?.id) {
      toast.error("Не найден декларант")
      return
    }
    try {
      await updateOrg({
        id: org.id,
        fullAddress: values.fullAddress,
        country: values.country,
        region: values.region,
        city: values.city,
        street: values.street || undefined,
        house: values.house || undefined,
        room: values.room || undefined,
        postalCode: values.postalCode,
      }).unwrap()

      await updateDeclarant({
        id: org.declarant.id,
        name: isIp ? org.declarant.name : (values.declarantName || null),
        surname: isIp ? org.declarant.surname : (values.declarantSurname || null),
        patronymic: isIp ? org.declarant.patronymic : (values.declarantPatronymic || null),
        position: values.declarantPosition || null,
        email: values.declarantEmail || null,
        phone: values.declarantPhone || null,
      }).unwrap()

      await createDocument({
        declarantId: org.declarant.id,
        typeCode: values.docTypeCode,
        typeShort: values.docTypeShort,
        series: values.docSeries || null,
        number: values.docNumber,
        issuedBy: values.docIssuedBy,
        issuedAt: new Date(values.docIssuedAt).toISOString(),
      }).unwrap()

      onComplete()
    } catch {
      toast.error("Ошибка при сохранении данных")
    }
  }

  return (
    <div className="w-full max-w-xl flex flex-col gap-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Данные организации</h2>
        <p className="text-sm text-muted-foreground mt-1">Проверьте и заполните недостающие поля</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

          {/* Орга — disabled */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Организация</h3>
            <div className="grid grid-cols-2 gap-3">
              <DisabledField label="Полное название" value={org.fullOrg} />
              <DisabledField label="ОПФ" value={org.fullOpf} />
              <DisabledField label="ИНН" value={org.inn} />
              <DisabledField label="ОГРН" value={org.ogrn} />
              {org.kpp && <DisabledField label="КПП" value={org.kpp} />}
              <DisabledField label="ОКАТО" value={org.okato5} />
            </div>
          </section>

          {/* Адрес — редактируемый */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Адрес</h3>
            <div className="grid grid-cols-2 gap-3">
              {(["country", "region", "city", "postalCode"] as const).map((f) => (
                <FormField key={f} control={form.control} name={f} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{{ country: "Страна", region: "Регион", city: "Город", postalCode: "Индекс" }[f]}</FormLabel>
                    <FormControl><Input {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
              <FormField control={form.control} name="fullAddress" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Полный адрес</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
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
            </div>
          </section>

          {/* Декларант */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Декларант</h3>
            <div className="grid grid-cols-2 gap-3">
              {isIp ? (
                <>
                  <DisabledField label="Имя" value={org.declarant?.name} />
                  <DisabledField label="Фамилия" value={org.declarant?.surname} />
                  <DisabledField label="Отчество" value={org.declarant?.patronymic} />
                </>
              ) : (
                <>
                  {(["declarantSurname", "declarantName", "declarantPatronymic"] as const).map((f) => (
                    <FormField key={f} control={form.control} name={f} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{{ declarantSurname: "Фамилия", declarantName: "Имя", declarantPatronymic: "Отчество" }[f]}</FormLabel>
                        <FormControl><Input {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  ))}
                </>
              )}
              {(["declarantPosition", "declarantEmail", "declarantPhone"] as const).map((f) => (
                <FormField key={f} control={form.control} name={f} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{{ declarantPosition: "Должность", declarantEmail: "Email", declarantPhone: "Телефон" }[f]}</FormLabel>
                    <FormControl><Input type={f === "declarantEmail" ? "email" : "text"} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
            </div>
          </section>

          {/* Документ */}
          <section className="flex flex-col gap-3">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Документ декларанта</h3>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="docTypeCode" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Тип документа</FormLabel>
                  <Select
                    value={field.value}
                    onValueChange={(val) => {
                      field.onChange(val)
                      const found = DOCUMENT_TYPES.find((d) => d.code === val)
                      if (found) form.setValue("docTypeShort", found.short)
                    }}
                  >
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Выберите тип..." /></SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-60">
                      {DOCUMENT_TYPES.map((d) => (
                        <SelectItem key={d.code} value={d.code}>
                          {d.short} — {d.code}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              {selectedTypeCode && (
                <div className="col-span-2 flex flex-col gap-1.5">
                  <span className="text-sm font-medium">Краткое обозначение</span>
                  <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted text-sm text-muted-foreground">
                    {form.getValues("docTypeShort")}
                  </div>
                </div>
              )}

              <FormField control={form.control} name="docSeries" render={({ field }) => (
                <FormItem>
                  <FormLabel>Серия</FormLabel>
                  <FormControl><Input placeholder="XX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="docNumber" render={({ field }) => (
                <FormItem>
                  <FormLabel>Номер</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="docIssuedBy" render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel>Кем выдан</FormLabel>
                  <FormControl><Input {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="docIssuedAt" render={({ field }) => (
                <FormItem>
                  <FormLabel>Дата выдачи</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </section>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Сохраняем..." : "Сохранить и продолжить"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
