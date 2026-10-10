import { z } from "zod"

export const emailSchema = z.object({
  email: z.email("Некорректный email").trim().toLowerCase(),
})

export const codeSchema = z.object({
  code: z.string().regex(/^\d{6}$/, "Код — 6 цифр"),
})

export type EmailFormValues = z.infer<typeof emailSchema>
export type CodeFormValues = z.infer<typeof codeSchema>
