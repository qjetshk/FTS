import { z } from "zod"

export const loginSchema = z.object({
  email: z.email("Некорректный email"),
  password: z.string().trim().min(8, "Пароль минимум 8 символов").max(64),
})

export type LoginFormValues = z.infer<typeof loginSchema>
