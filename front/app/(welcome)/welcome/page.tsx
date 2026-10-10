"use client"

import { useRouter } from "next/navigation"
import { SetNameForm } from "@/features/set-user-name"
import { ROUTES } from "@/shared/config"

export default function WelcomePage() {
  const router = useRouter()
  // AuthGuard дашборда сам отправит на онбординг, если он не пройден
  return <SetNameForm onDone={() => router.replace(ROUTES.dashboard)} />
}
