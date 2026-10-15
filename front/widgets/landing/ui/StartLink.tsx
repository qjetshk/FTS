import Link from "next/link"
import { buttonVariants } from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib"

// Главная кнопка лендинга: залогиненному — в кабинет, остальным — на вход (он же регистрация)
export function StartLink({ authed, size = "xl", className }: { authed: boolean; size?: "lg" | "xl"; className?: string }) {
  return (
    <Link
      href={authed ? ROUTES.dashboard : ROUTES.login}
      className={cn(buttonVariants({ size }), "no-underline", className)}
    >
      {authed ? "Открыть кабинет" : "Начать бесплатно"}
    </Link>
  )
}
