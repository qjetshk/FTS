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
  loginSchema,
  type LoginFormValues,
  useLoginMutation,
} from "@/entities/user"

export function LoginForm() {
  const router = useRouter()
  const [login, { isLoading }] = useLoginMutation()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const result = await login(values).unwrap()
      localStorage.setItem("access_token", result.accessToken)
      localStorage.setItem("user", JSON.stringify(result.user))
      router.push(ROUTES.dashboard)
    } catch {
      toast.error("Неверный email или пароль")
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full max-w-80">
        <div className="mb-4">
          <h1 className="text-2xl font-semibold tracking-tight text-center">Вход</h1>
        </div>

        <div className="flex flex-col gap-4">
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
          {isLoading ? "Входим..." : "Войти"}
        </Button>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Нет аккаунта?{" "}
          <Link
            href={ROUTES.register}
            className="font-medium text-primary hover:underline"
          >
            Зарегистрируйтесь
          </Link>
        </p>
      </form>
    </Form>
  )
}
