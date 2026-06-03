"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/shared/ui"

export function ResetPasswordButton() {
  const [sent, setSent] = useState(false)

  const handleClick = () => {
    // TODO: call POST /auth/request-password-reset when email service is ready
    setSent(true)
    toast.success("Письмо со ссылкой для сброса отправлено на вашу почту")
  }

  return (
    <Button variant="outline" onClick={handleClick} disabled={sent}>
      {sent ? "Письмо отправлено" : "Сбросить пароль"}
    </Button>
  )
}
