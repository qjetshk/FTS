"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import {
  Form, FormField, FormItem, FormLabel, FormControl, FormMessage,
  Button, Input,
} from "@/shared/ui"
import { useMeQuery, useUpdateProfileMutation, type User } from "@/entities/user"
import { editProfileSchema, type EditProfileValues } from "../model/edit-profile.schema"

export function EditProfileForm() {
  const { data: user } = useMeQuery()
  const [updateProfile, { isLoading }] = useUpdateProfileMutation()

  const form = useForm<EditProfileValues>({
    resolver: zodResolver(editProfileSchema),
    values: { name: user?.name ?? "" },
  })

  const onSubmit = async (values: EditProfileValues) => {
    try {
      await updateProfile(values).unwrap()
      toast.success("Имя обновлено")
    } catch {
      toast.error("Не удалось сохранить")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Имя</FormLabel>
            <FormControl><Input {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <Button
          type="submit"
          variant="outline"
          className="w-fit"
          disabled={isLoading || !form.formState.isDirty}
        >
          {isLoading ? "Сохраняем..." : "Сохранить"}
        </Button>
      </form>
    </Form>
  )
}
