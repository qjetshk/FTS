import { z } from "zod"

export const editProfileSchema = z.object({
  name: z.string().min(1, "Имя обязательно").max(100),
})

export type EditProfileValues = z.infer<typeof editProfileSchema>
