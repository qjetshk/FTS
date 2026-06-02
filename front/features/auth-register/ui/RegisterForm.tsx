"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Button,
  Input,
} from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import {
  registerSchema,
  type RegisterFormValues,
  useRegisterMutation,
} from "@/entities/user"

export function RegisterForm() {
  const router = useRouter()
  const [register, { isLoading }] = useRegisterMutation()

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  })

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      const result = await register(values).unwrap()
      localStorage.setItem("access_token", result.accessToken)
      localStorage.setItem("user:v1", JSON.stringify(result.user))
      router.push(ROUTES.onboarding)
    } catch {
      toast.error("Не удалось создать аккаунт. Возможно, email уже занят")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-80">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-center">Регистрация</h1>
        </div>

        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input placeholder="Иван Иванов" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="email" placeholder="you@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input type="password" placeholder="••••••••" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="mt-6 w-full" disabled={isLoading}>
          {isLoading ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Уже есть аккаунт?{" "}
          <Link
            href={ROUTES.login}
            className="font-medium text-primary hover:underline"
          >
            Войти
          </Link>
        </p>
      </form>
    </Form>
  )
}
