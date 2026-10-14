"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"
import { Mail } from "lucide-react"
import {
  Button, Form, FormControl, FormField, FormItem, FormMessage, Input,
  InputOTP, InputOTPGroup, InputOTPSlot,
} from "@/shared/ui"
import { getApiErrorMessage } from "@/shared/lib"
import {
  emailSchema, type EmailFormValues,
  useRequestEmailLinkCodeMutation, useVerifyEmailLinkMutation,
} from "@/entities/user"

const CODE_LENGTH = 6

// Для вошедших через Telegram: почта — запасной вход и канал для писем со статформами
export function LinkEmailCard() {
  const [email, setEmail] = useState<string | null>(null)
  const [code, setCode] = useState("")
  const [requestCode, { isLoading: sending }] = useRequestEmailLinkCodeMutation()
  const [verify, { isLoading: verifying }] = useVerifyEmailLinkMutation()

  const form = useForm<EmailFormValues>({ resolver: zodResolver(emailSchema), defaultValues: { email: "" } })

  const onSend = async (values: EmailFormValues) => {
    try {
      await requestCode(values).unwrap()
      setEmail(values.email)
    } catch (e) {
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"))
    }
  }

  const onVerify = async (value: string) => {
    if (!email) return
    try {
      const user = await verify({ email, code: value }).unwrap()
      // сайдбар читает юзера из localStorage
      localStorage.setItem("user:v1", JSON.stringify(user))
      toast.success("Почта привязана")
    } catch (e) {
      setCode("")
      toast.error(getApiErrorMessage(e, "Неверный код"))
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
      <div className="flex items-center gap-3">
        <Mail strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium">Почта не привязана</span>
          <span className="text-xs text-muted-foreground">
            {email ? `Код отправлен на ${email}` : "Запасной способ входа и письма со статформами"}
          </span>
        </div>
      </div>

      {email ? (
        <div className="flex flex-wrap items-center gap-3">
          <InputOTP
            maxLength={CODE_LENGTH}
            value={code}
            onChange={setCode}
            onComplete={onVerify}
            disabled={verifying}
            autoFocus
            inputMode="numeric"
            pattern="^\d*$"
          >
            <InputOTPGroup>
              {Array.from({ length: CODE_LENGTH }).map((_, i) => (
                <InputOTPSlot key={`slot-${i}`} index={i} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <Button variant="link" size="sm" className="h-auto px-0 text-muted-foreground" onClick={() => setEmail(null)}>
            Другая почта
          </Button>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSend)} className="flex gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input type="email" autoComplete="email" placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={sending}>
              {sending ? "Отправляем..." : "Получить код"}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}
