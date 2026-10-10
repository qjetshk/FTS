"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useMeQuery } from "@/entities/user"
import { ROUTES } from "@/shared/config"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: user, isLoading: userLoading, isError: userError } = useMeQuery()

  useEffect(() => {
    if (!userLoading && userError) {
      router.replace(ROUTES.login)
    }
  }, [userLoading, userError, router])

  useEffect(() => {
    if (userLoading || !user) return
    if (!user.name) router.replace(ROUTES.welcome)
    else if (user.isOnboardingComplete) router.replace(ROUTES.statforms)
  }, [userLoading, user, router])

  if (userLoading || (user && !user.name)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
