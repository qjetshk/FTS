"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useMeQuery } from "@/entities/user"
import { ROUTES } from "@/shared/config"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: user, isLoading: userLoading, isError: userError } = useMeQuery()

  useEffect(() => {
    if (!userLoading && userError) {
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
      router.replace(ROUTES.login)
    }
  }, [userLoading, userError, router])

  useEffect(() => {
    if (!userLoading && user && !user.isOnboardingComplete) {
      router.replace(ROUTES.onboarding)
    }
  }, [userLoading, user, router])

  if (userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
