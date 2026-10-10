"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Form, FormField, FormItem, FormControl, FormMessage, Button, Input } from "@/shared/ui"
import { profileNameSchema, type ProfileNameValues, useUpdateProfileMutation } from "@/entities/user"

type Props = {
  onDone: () => void
}

export function SetNameForm({ onDone }: Props) {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const form = useForm<ProfileNameValues>({
    resolver: zodResolver(profileNameSchema),
    defaultValues: { name: "" },
  })

  const onSubmit = async (values: ProfileNameValues) => {
    try {
      await updateProfile(values).unwrap()
      onDone()
    } catch {
      toast.error("Не удалось сохранить имя")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-80">
        <div className="mb-4 flex flex-col gap-1 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Как вас зовут?</h1>
          <p className="text-sm text-muted-foreground">Так мы будем обращаться к вам в письмах и уведомлениях</p>
        </div>

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input autoComplete="given-name" autoFocus placeholder="Имя" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
          {isLoading ? "Сохраняем..." : "Продолжить"}
        </Button>
      </form>
    </Form>
  )
}
