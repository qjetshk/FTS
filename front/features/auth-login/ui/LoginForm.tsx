"use client"

import { useState } from "react"
import { EmailStep } from "./EmailStep"
import { CodeStep } from "./CodeStep"

// Вход = регистрация: почта → код. Нового пользователя бэк создаёт сам при первом верном коде.
export function LoginForm() {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<"email" | "code">("email")

  if (step === "code") {
    return <CodeStep email={email} onChangeEmail={() => setStep("email")} />
  }

  return (
    <EmailStep
      defaultEmail={email}
      onSent={(value) => {
        setEmail(value)
        setStep("code")
      }}
    />
  )
}
