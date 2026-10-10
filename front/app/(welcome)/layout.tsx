"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useMeQuery } from "@/entities/user"
import { AuthVisual } from "@/widgets/auth-visual"
import { ROUTES } from "@/shared/config"

// Шаг между входом и онбордингом: доступен только залогиненному пользователю без имени
export default function WelcomeLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: user, isLoading, isError } = useMeQuery()

  useEffect(() => {
    if (!isLoading && isError) router.replace(ROUTES.login)
  }, [isLoading, isError, router])

  useEffect(() => {
    if (!isLoading && user?.name) router.replace(ROUTES.dashboard)
  }, [isLoading, user, router])

  if (isLoading || !user || user.name) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col items-center justify-center px-8 py-10 sm:px-12 lg:w-1/2">
        {children}
      </div>
      <div className="sticky top-0 hidden h-screen w-1/2 lg:block">
        <AuthVisual />
      </div>
    </div>
  )
}
