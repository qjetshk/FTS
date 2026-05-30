import { z } from "zod"

export const apiKeysSchema = z.object({
  apiKey: z.string().min(1, "Введите API Key"),
  clientId: z.string().min(1, "Введите Client ID").regex(/^\d+$/, "Client ID должен быть числом"),
})

export type ApiKeysFormValues = z.infer<typeof apiKeysSchema>
