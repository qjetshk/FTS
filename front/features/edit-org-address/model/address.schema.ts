import { z } from "zod"

export const addressSchema = z.object({
  street: z.string().trim().optional(),
  house: z.string().trim().optional(),
  room: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
})

export type AddressValues = z.infer<typeof addressSchema>
