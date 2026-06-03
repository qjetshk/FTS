"use client"

import * as React from "react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { ChevronsUpDown } from "lucide-react"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  Button, Input,
  Popover, PopoverContent, PopoverTrigger,
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/shared/ui"
import { cn } from "@/shared/lib"
import {
  useUpdateDeclarantMutation,
  useCreateDocumentMutation,
  DOCUMENT_TYPES,
  type Organization,
} from "@/entities/organization"
import { orgFormSchema, type OrgFormValues } from "./model/org-form.schema"

type Props = {
  org: Organization
  onSaved?: () => void
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

type DocTypeSelectProps = {
  field: { value: string; onChange: (...event: unknown[]) => void }
  fieldState: { error?: unknown }
  onValueChange: (short: string) => void
}

function DocTypeSelect({ field, fieldState, onValueChange }: DocTypeSelectProps) {
  const [open, setOpen] = useState(false)
  const scrollY = React.useRef(0)
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) scrollY.current = window.scrollY
    setOpen(newOpen)
    if (newOpen) requestAnimationFrame(() => window.scrollTo(0, scrollY.current))
  }
  const selected = DOCUMENT_TYPES.find((d) => d.code === field.value)
  return (
    <FormItem className="col-span-2">
      <FormLabel>Тип документа</FormLabel>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
            fieldState.error ? "border-destructive" : "border-input",
            !selected && "text-muted-foreground"
          )}
        >
          {selected ? selected.name : "Выберите тип..."}
          <ChevronsUpDown className="size-4 opacity-50 shrink-0 ml-2" />
        </PopoverTrigger>
        <PopoverContent className="w-(--anchor-width) min-w-80 p-0" align="start">
          <Command className="bg-background">
            <CommandInput placeholder="Поиск..." autoFocus={false} />
            <CommandList className="max-h-60">
              <CommandEmpty>Ничего не найдено</CommandEmpty>
              <CommandGroup>
                {DOCUMENT_TYPES.map((d) => (
                  <CommandItem
                    key={d.code}
                    value={`${d.name} ${d.short} ${d.code}`}
                    data-checked={field.value === d.code}
                    className="data-selected:bg-transparent data-selected:text-foreground cursor-pointer hover:bg-accent rounded-sm"
                    onSelect={() => {
                      field.onChange(d.code)
                      onValueChange(d.short)
                      setOpen(false)
                    }}
                  >
                    {d.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )
}

export function OrgForm({ org, onSaved }: Props) {
  const isIp = org.fullOpf.toLowerCase().includes("индивидуальный предприниматель") ||
    org.fullOpf.toLowerCase().includes(" ип") ||
    org.fullOpf.startsWith("ИП")

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
          name: isIp ? org.declarant.name : (values.declarantName || null),
          surname: isIp ? org.declarant.surname : (values.declarantSurname || null),
          patronymic: isIp ? org.declarant.patronymic : (values.declarantPatronymic || null),
          position: isIp ? "Индивидуальный предприниматель" : (values.declarantPosition || null),
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
            {isIp ? (
              <>
                <DisabledField label="Имя" value={org.declarant?.name} />
                <DisabledField label="Фамилия" value={org.declarant?.surname} />
                <DisabledField label="Отчество" value={org.declarant?.patronymic} />
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
            {isIp
              ? <DisabledField label="Должность" value="Индивидуальный предприниматель" />
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
