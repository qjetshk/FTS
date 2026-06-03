"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  Button, Input,
  FieldReadonly,
} from "@/shared/ui"
import {
  useUpdateDeclarantMutation,
  useCreateDocumentMutation,
  isIp,
  type Organization,
} from "@/entities/organization"
import { orgFormSchema, type OrgFormValues } from "./model/org-form.schema"
import { DocTypeSelect } from "./ui/DocTypeSelect"

type Props = {
  org: Organization
  onSaved?: () => void
}

export function OrgForm({ org, onSaved }: Props) {
  const ip = isIp(org)

  const doc = org.declarant?.document
  const hasDoc = !!doc

  const [updateDeclarant, { isLoading: declarantLoading }] = useUpdateDeclarantMutation()
  const [createDocument, { isLoading: docLoading }] = useCreateDocumentMutation()

  const isLoading = declarantLoading || docLoading

  const form = useForm<OrgFormValues>({
    resolver: zodResolver(orgFormSchema),
    defaultValues: {
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

  const onSubmit = async (values: OrgFormValues) => {
    if (!org.declarant?.id) {
      toast.error("Не найден декларант")
      return
    }
    try {
      await Promise.all([
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
      onSaved?.()
    } catch {
      toast.error("Ошибка при сохранении данных")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">

        {/* Декларант */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Декларант</h3>
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
            {ip
              ? <FieldReadonly label="Должность" value="Индивидуальный предприниматель" />
              : (
                <FormField control={form.control} name="declarantPosition" render={({ field }) => (
                  <FormItem><FormLabel>Должность</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              )
            }
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

        {/* Документ */}
        <section className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {hasDoc ? "Документ декларанта" : "Документ декларанта (не заполнен)"}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <FormField control={form.control} name="docTypeCode" render={({ field, fieldState }) => (
              <DocTypeSelect field={field} fieldState={fieldState} onValueChange={(short) => form.setValue("docTypeShort", short)} />
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
          {isLoading ? "Сохраняем..." : hasDoc ? "Сохранить изменения" : "Сохранить и продолжить"}
        </Button>
      </form>
    </Form>
  )
}
