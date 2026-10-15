"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button, InputOTP, InputOTPGroup, InputOTPSlot } from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { setAccessToken } from "@/shared/api"
import { getApiErrorMessage, getApiRetryAfter } from "@/shared/lib"
import { useRequestCodeMutation, useVerifyCodeMutation } from "@/entities/user"
import { useCountdown } from "../lib/use-countdown.lib"

const CODE_LENGTH = 6
const RESEND_SECONDS = 60

type Props = {
  email: string
  onChangeEmail: () => void
}

export function CodeStep({ email, onChangeEmail }: Props) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [verifyCode, { isLoading: isVerifying }] = useVerifyCodeMutation()
  const [requestCode, { isLoading: isResending }] = useRequestCodeMutation()
  const { seconds, start } = useCountdown()

  useEffect(() => start(RESEND_SECONDS), [start])

  const submit = async (value: string) => {
    try {
      const result = await verifyCode({ email, code: value }).unwrap()
      setAccessToken(result.accessToken)
      localStorage.setItem("user:v1", JSON.stringify(result.user))
      // дальше AuthGuard сам отправит на /welcome или /onboarding, если нужно
      router.push(ROUTES.dashboard)
    } catch (e) {
      setCode("")
      toast.error(getApiErrorMessage(e, "Неверный код"))
    }
  }

  const resend = async () => {
    try {
      await requestCode({ email }).unwrap()
      start(RESEND_SECONDS)
      toast.success("Новый код отправлен")
    } catch (e) {
      start(getApiRetryAfter(e) ?? RESEND_SECONDS)
      toast.error(getApiErrorMessage(e, "Не удалось отправить код"))
    }
  }

  return (
    <div className="flex w-full max-w-80 flex-col items-center">
      <div className="mb-6 flex flex-col gap-1 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Введите код</h1>
        <p className="text-sm text-muted-foreground">
          Отправили 6 цифр на <span className="font-medium text-foreground">{email}</span>
        </p>
      </div>

      <InputOTP
        maxLength={CODE_LENGTH}
        value={code}
        onChange={setCode}
        onComplete={submit}
        disabled={isVerifying}
        autoFocus
        inputMode="numeric"
        pattern="^\d*$"
      >
        <InputOTPGroup>
          {Array.from({ length: CODE_LENGTH }).map((_, i) => (
            <InputOTPSlot key={`slot-${i}`} index={i} className="size-11 text-lg" />
          ))}
        </InputOTPGroup>
      </InputOTP>

      <Button
        className="mt-6 w-full"
        disabled={isVerifying || code.length < CODE_LENGTH}
        onClick={() => submit(code)}
      >
        {isVerifying ? "Проверяем..." : "Войти"}
      </Button>

      <div className="mt-4 flex w-full items-center justify-between text-sm">
        <Button variant="link" className="h-auto px-0 text-muted-foreground" onClick={onChangeEmail}>
          Другая почта
        </Button>
        <Button
          variant="link"
          className="h-auto px-0"
          disabled={seconds > 0 || isResending}
          onClick={resend}
        >
          {seconds > 0 ? `Отправить снова через ${seconds} с` : "Отправить снова"}
        </Button>
      </div>
    </div>
  )
}
