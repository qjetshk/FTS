"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  Button, Input, FieldReadonly,
} from "@/shared/ui"
import {
  useUpdateOrganizationMutation,
  useUpdateDeclarantMutation,
  useCreateDocumentMutation,
  DocTypeSelect,
  isIp,
  type Organization,
} from "@/entities/organization"
import { onboardingOrgSchema, type OnboardingOrgValues } from "../model/onboarding-org.schema"

type Props = {
  org: Organization
  onComplete: () => void
}

export function OrgFormStep({ org, onComplete }: Props) {
  const ip = isIp(org)
  const doc = org.declarant?.document
  const hasDoc = !!doc

  const [updateOrg] = useUpdateOrganizationMutation()
  const [updateDeclarant, { isLoading: declarantLoading }] = useUpdateDeclarantMutation()
  const [createDocument, { isLoading: docLoading }] = useCreateDocumentMutation()
  const isLoading = declarantLoading || docLoading

  const form = useForm<OnboardingOrgValues>({
    resolver: zodResolver(onboardingOrgSchema),
    defaultValues: {
      street: org.street ?? "",
      house: org.house ?? "",
      room: org.room ?? "",
      postalCode: org.postalCode ?? "",
      declarantName: org.declarant?.name ?? "",
      declarantSurname: org.declarant?.surname ?? "",
      declarantPatronymic: org.declarant?.patronymic ?? "",
      declarantPosition: org.declarant?.position ?? "",
      declarantEmail: org.declarant?.email ?? "",
      declarantPhone: org.declarant?.phone ?? "",
      docTypeCode: doc?.typeCode ?? "",
      docTypeShort: doc?.typeShort ?? "",
      docSeries: doc?.series ?? "",
      docNumber: doc?.number ?? "",
      docIssuedBy: doc?.issuedBy ?? "",
      docIssuedAt: doc?.issuedAt ? new Date(doc.issuedAt).toISOString().split("T")[0] : "",
    },
  })

  const selectedTypeCode = form.watch("docTypeCode")

  const onSubmit = async (values: OnboardingOrgValues) => {
    if (!org.declarant?.id) {
      toast.error("Не найден декларант")
      return
    }

    const street = ip ? (values.street || undefined) : (org.street ?? undefined)
    const house = ip ? (values.house || undefined) : (org.house ?? undefined)
    const room = ip ? (values.room || undefined) : (org.room ?? undefined)
    const postalCode = ip ? values.postalCode : org.postalCode
    const fullAddress = [postalCode, org.country, org.region, org.city, street, house, room]
      .filter(Boolean)
      .join(", ")

    try {
      await Promise.all([
        updateOrg({
          id: org.id,
          fullAddress,
          country: org.country,
          region: org.region,
          city: org.city,
          street,
          house,
          room,
          postalCode,
        }).unwrap(),
        updateDeclarant({
          id: org.declarant.id,
          name: ip ? org.declarant.name : (values.declarantName || null),
          surname: ip ? org.declarant.surname : (values.declarantSurname || null),
          patronymic: ip ? org.declarant.patronymic : (values.declarantPatronymic || null),
          position: ip ? "Индивидуальный предприниматель" : (values.declarantPosition || null),
          email: values.declarantEmail || null,
          phone: values.declarantPhone || null,
        }).unwrap(),
        createDocument({
          declarantId: org.declarant.id,
          typeCode: values.docTypeCode,
          typeShort: values.docTypeShort,
          series: values.docSeries || null,
          number: values.docNumber,
          issuedBy: values.docIssuedBy,
          issuedAt: new Date(values.docIssuedAt).toISOString(),
        }).unwrap(),
      ])

      toast.success("Данные сохранены")
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

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Декларант</h3>
            <div className="grid grid-cols-2 gap-3">
              {ip ? (
                <>
                  <FieldReadonly label="Имя" value={org.declarant?.name} />
                  <FieldReadonly label="Фамилия" value={org.declarant?.surname} />
                  <FieldReadonly label="Отчество" value={org.declarant?.patronymic} />
                </>
              ) : (
                (["declarantSurname", "declarantName", "declarantPatronymic"] as const).map((f) => (
                  <FormField key={f} control={form.control} name={f} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{{ declarantSurname: "Фамилия", declarantName: "Имя", declarantPatronymic: "Отчество" }[f]}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                ))
              )}
              {ip ? (
                <FieldReadonly label="Должность" value="Индивидуальный предприниматель" />
              ) : (
                <FormField control={form.control} name="declarantPosition" render={({ field }) => (
                  <FormItem><FormLabel>Должность</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              )}
              {(["declarantEmail", "declarantPhone"] as const).map((f) => (
                <FormField key={f} control={form.control} name={f} render={({ field }) => (
                  <FormItem>
                    <FormLabel>{{ declarantEmail: "Email", declarantPhone: "Телефон" }[f]}</FormLabel>
                    <FormControl><Input type={f === "declarantEmail" ? "email" : "text"} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              ))}
            </div>
          </section>

          <section className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {hasDoc ? "Документ декларанта" : "Документ декларанта (не заполнен)"}
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="docTypeCode" render={({ field, fieldState }) => (
                <DocTypeSelect
                  field={field}
                  fieldState={fieldState}
                  onValueChange={(short) => form.setValue("docTypeShort", short)}
                />
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
                <FormItem><FormLabel>Серия</FormLabel><FormControl><Input placeholder="XX" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="docNumber" render={({ field }) => (
                <FormItem><FormLabel>Номер</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="docIssuedBy" render={({ field }) => (
                <FormItem className="col-span-2"><FormLabel>Кем выдан</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="docIssuedAt" render={({ field }) => (
                <FormItem><FormLabel>Дата выдачи</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
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
