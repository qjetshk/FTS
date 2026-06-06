import { z } from "zod"

const strReq = (msg: string) => z.string().trim().min(1, msg)
const strOpt = () => z.string().trim().optional()

export const onboardingOrgSchema = z.object({
  street: strOpt(),
  house: strOpt(),
  room: strOpt(),
  postalCode: strOpt(),

  declarantName: strOpt(),
  declarantSurname: strOpt(),
  declarantPatronymic: strOpt(),
  declarantPosition: strOpt(),
  declarantEmail: z.string().email("Некорректный email").optional().or(z.literal("")),
  declarantPhone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s\-\(\)]+$/, "Только цифры, +, пробелы, скобки, дефис")
    .refine((v) => v.replace(/\D/g, "").length >= 11, "Минимум 11 цифр")
    .optional()
    .or(z.literal("")),

  docTypeCode: strReq("Выберите тип документа"),
  docTypeShort: z.string(),
  docSeries: z
    .string()
    .trim()
    .min(1, "Введите серию")
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-]+$/, "Только буквы, цифры и дефис"),
  docNumber: z
    .string()
    .trim()
    .min(1, "Введите номер документа")
    .regex(/^[a-zA-Zа-яА-ЯёЁ0-9\s\-]+$/, "Только буквы, цифры и дефис"),
  docIssuedBy: strReq("Введите кем выдан"),
  docIssuedAt: strReq("Введите дату выдачи"),
})

export type OnboardingOrgValues = z.infer<typeof onboardingOrgSchema>
