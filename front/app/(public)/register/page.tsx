import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { RegisterForm } from "@/features/auth-register"
import { ROUTES } from "@/shared/config"

export const metadata: Metadata = {
  title: "Регистрация — easyfts",
  description: "Создайте аккаунт для работы с таможенной отчётностью OZON",
}

export default function RegisterPage() {
  return (
    <div className="flex flex-1 flex-col">
      <Link
        href={ROUTES.home}
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="size-4" strokeWidth={1.5} />
        На главную
      </Link>
      <div className="flex flex-1 items-center justify-center">
        <RegisterForm />
      </div>
    </div>
  )
}
