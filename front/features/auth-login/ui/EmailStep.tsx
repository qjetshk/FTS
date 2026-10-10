"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormControl, FormMessage, Button, Input } from "@/shared/ui"
import { getApiErrorMessage } from "@/shared/lib"
import { emailSchema, type EmailFormValues, useRequestCodeMutation } from "@/entities/user"

type Props = {
  defaultEmail?: string
  onSent: (email: string) => void
}

export function EmailStep({ defaultEmail = "", onSent }: Props) {
  const [requestCode, { isLoading }] = useRequestCodeMutation()

  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: defaultEmail },
  })

  const onSubmit = async ({ email }: EmailFormValues) => {
    try {
      await requestCode({ email }).unwrap()
      onSent(email)
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"))
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-80">
        <div className="mb-4 flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Вход</h1>
          <p className="text-sm text-muted-foreground">Пришлём код на почту — пароль не нужен</p>
        </div>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input type="email" autoComplete="email" autoFocus placeholder="you@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
          {isLoading ? "Отправляем..." : "Получить код"}
        </Button>
      </form>
    </Form>
  )
}
