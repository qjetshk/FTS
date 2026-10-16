import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ROUTES } from "@/shared/config"
import { setAccessToken } from "@/shared/api"
import { getApiErrorMessage } from "@/shared/lib"
import { useTelegramWebAppLoginMutation } from "@/entities/user"
import { getInitData } from "./telegram-webapp.util"

type Status = { kind: "loading" } | { kind: "not-telegram" } | { kind: "error"; message: string }

// Вход в Mini App: Telegram отдаёт подписанный initData, бэк проверяет подпись и выдаёт сессию.
// Встроенный браузер Telegram не хранит cookie между запусками — поэтому входим при каждом открытии
export function useTelegramWebAppLogin() {
  const router = useRouter()
  const [login] = useTelegramWebAppLoginMutation()
  const [status, setStatus] = useState<Status>({ kind: "loading" })
  const started = useRef(false)

  const run = useCallback(async () => {
    const initData = getInitData()
    if (!initData) {
      setStatus({ kind: "not-telegram" })
      return
    }
    setStatus({ kind: "loading" })
    try {
      const res = await login({ initData }).unwrap()
      setAccessToken(res.accessToken)
      localStorage.setItem("user:v1", JSON.stringify(res.user))
      // дальше AuthGuard сам отправит на /welcome или /onboarding, если нужно
      router.replace(ROUTES.dashboard)
    } catch (e) {
      setStatus({ kind: "error", message: getApiErrorMessage(e, "Не удалось войти — попробуйте ещё раз") })
    }
  }, [login, router])

  useEffect(() => {
    if (started.current) return
    started.current = true
    void run()
  }, [run])

  return { status, retry: run }
}
