"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useMeQuery } from "@/entities/user"
import { ROUTES } from "@/shared/config"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: user, isLoading, isError } = useMeQuery()

  useEffect(() => {
    if (!isLoading && isError) {
      localStorage.removeItem("access_token")
      localStorage.removeItem("user")
      router.replace(ROUTES.login)
    }
  }, [isLoading, isError, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
