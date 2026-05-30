import { z } from "zod"

export const registerSchema = z.object({
  name: z.string().min(2, "Имя минимум 2 символа").max(50),
  email: z.string().email("Некорректный email"),
  password: z.string().min(8, "Пароль минимум 8 символов").max(64),
})

export type RegisterFormValues = z.infer<typeof registerSchema>
