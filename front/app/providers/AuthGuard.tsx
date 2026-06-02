"use client"

import { useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useMeQuery, useResetOnboardingMutation } from "@/entities/user"
import { useGetFirstOrgQuery } from "@/entities/organization"
import { ROUTES } from "@/shared/config"

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const hasResetRef = useRef(false)

  const { data: user, isLoading: userLoading, isError: userError } = useMeQuery()

  // Only check org when user is loaded and claims onboarding is complete
  const skipOrgCheck = userLoading || !user || !user.isOnboardingComplete
  const { isError: orgIsError, error: orgFetchError, isLoading: orgLoading } = useGetFirstOrgQuery(undefined, {
    skip: skipOrgCheck,
  })
  const [resetOnboarding] = useResetOnboardingMutation()

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

  // Edge case: isOnboardingComplete = true but org was deleted → reset flag so onboarding re-runs
  useEffect(() => {
    if (!orgIsError) return
    const err = orgFetchError as { status?: number } | undefined
    if (err?.status === 404 && !hasResetRef.current) {
      hasResetRef.current = true
      resetOnboarding()
      // invalidatesTags: ["User"] causes useMeQuery to re-fetch →
      // isOnboardingComplete becomes false → existing effect redirects to /onboarding
    }
  }, [orgIsError, orgFetchError, resetOnboarding])

  const is404 = orgIsError && (orgFetchError as { status?: number })?.status === 404

  if (userLoading || (!skipOrgCheck && (orgLoading || is404))) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!user) return null

  return <>{children}</>
}
