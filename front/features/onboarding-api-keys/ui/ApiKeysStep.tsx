"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage, Button, Input } from "@/shared/ui"
import { useCompanyInfoMutation, useClassifyMutation } from "@/entities/organization"
import { useMeQuery } from "@/entities/user"
import { apiKeysSchema, type ApiKeysFormValues } from "../model/api-keys.schema"

type Props = {
  onComplete: (orgData: any, apiKey: string, clientId: string) => void
}

export function ApiKeysStep({ onComplete }: Props) {
  const { data: user } = useMeQuery()
  const [companyInfo, { isLoading }] = useCompanyInfoMutation()
  const [classify] = useClassifyMutation()

  const form = useForm<ApiKeysFormValues>({
    resolver: zodResolver(apiKeysSchema),
    defaultValues: { apiKey: "", clientId: "" },
  })

  const onSubmit = async (values: ApiKeysFormValues) => {
    if (!user) {
      toast.error("Пользователь не найден, войдите заново")
      return
    }
    try {
      const orgData = await companyInfo({
        apiKey: values.apiKey,
        clientId: values.clientId,
        userId: user.id,
      }).unwrap()

      classify({ clientId: values.clientId })

      onComplete(orgData, values.apiKey, values.clientId)
    } catch {
      toast.error("Не удалось получить данные организации. Проверьте ключи.")
    }
  }

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Подключите магазин OZON</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Найдите ключи в личном кабинете OZON → Настройки → API
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full flex flex-col gap-4">
          <FormField
            control={form.control}
            name="apiKey"
            render={({ field }) => (
              <FormItem>
                <FormLabel>API Key</FormLabel>
                <FormControl>
                  <Input placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client ID</FormLabel>
                <FormControl>
                  <Input placeholder="123456" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="mt-2 w-full" disabled={isLoading}>
            {isLoading ? "Получаем данные..." : "Далее"}
          </Button>
        </form>
      </Form>
    </div>
  )
}
