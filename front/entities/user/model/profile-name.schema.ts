import { z } from "zod"

export const profileNameSchema = z.object({
  name: z.string().trim().min(2, "Имя минимум 2 символа").max(50, "Имя максимум 50 символов"),
})

export type ProfileNameValues = z.infer<typeof profileNameSchema>
