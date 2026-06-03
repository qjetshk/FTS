"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  Button, Input, FieldReadonly,
} from "@/shared/ui"
import { useUpdateOrganizationMutation, isIp, type Organization } from "@/entities/organization"
import { addressSchema, type AddressValues } from "../model/address.schema"

type Props = {
  org: Organization
}

export function OrgDetailsForm({ org }: Props) {
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

        {ip && (
          <Button type="submit" disabled={!form.formState.isDirty || isLoading} className="w-full">
            {isLoading ? "Сохраняем..." : "Сохранить адрес"}
          </Button>
        )}
      </form>
    </Form>
  )
}
