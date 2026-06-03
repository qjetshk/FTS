import { z } from "zod"

export const apiKeySchema = z.object({
  ozonApiKey: z.string().trim().min(1, "Введите API-ключ"),
})

export type ApiKeyValues = z.infer<typeof apiKeySchema>
