import { z } from "zod"

export const orgFormSchema = z.object({
  fullAddress: z.string().min(1, "Введите адрес"),
  country: z.string().min(1, "Введите страну"),
  region: z.string().min(1, "Введите регион"),
  city: z.string().min(1, "Введите город"),
  street: z.string().optional(),
  house: z.string().optional(),
  room: z.string().optional(),
  postalCode: z.string().min(1, "Введите индекс"),

  declarantName: z.string().optional(),
  declarantSurname: z.string().optional(),
  declarantPatronymic: z.string().optional(),
  declarantPosition: z.string().optional(),
  declarantEmail: z.string().email("Некорректный email").optional().or(z.literal("")),
  declarantPhone: z.string().optional(),

  docTypeCode: z.string().min(1, "Выберите тип документа"),
  docTypeShort: z.string(),
  docSeries: z.string().optional(),
  docNumber: z.string().min(1, "Введите номер документа"),
  docIssuedBy: z.string().min(1, "Введите кем выдан"),
  docIssuedAt: z.string().min(1, "Введите дату выдачи"),
})

export type OrgFormValues = z.infer<typeof orgFormSchema>
