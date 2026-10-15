import { useCallback, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ROUTES } from "@/shared/config"
import { setAccessToken } from "@/shared/api"
import { getApiErrorMessage } from "@/shared/lib"
import { useTelegramLoginPollMutation, useTelegramLoginStartMutation } from "@/entities/user"

const POLL_INTERVAL = 2_000

// Вход через бота: start → открываем t.me/<bot>?start=login_… → опрашиваем poll, пока юзер не нажмёт «Войти» в Telegram
export function useTelegramLogin() {
  const router = useRouter()
  const [start, { isLoading: starting }] = useTelegramLoginStartMutation()
  const [poll] = useTelegramLoginPollMutation()
  const [session, setSession] = useState<{ token: string; url: string } | null>(null)
  const inFlight = useRef(false)

  const cancel = useCallback(() => setSession(null), [])

  useEffect(() => {
    if (!session) return
    const timer = setInterval(async () => {
      if (inFlight.current) return
      inFlight.current = true
      try {
        const res = await poll({ token: session.token }).unwrap()
        if (res.status === "ok") {
          clearInterval(timer)
          setAccessToken(res.accessToken)
          localStorage.setItem("user:v1", JSON.stringify(res.user))
          // дальше AuthGuard сам отправит на /welcome или /onboarding, если нужно
          router.push(ROUTES.dashboard)
        } else if (res.status === "cancelled") {
          setSession(null)
          toast.info("Вход отменён в Telegram")
        }
      } catch (e) {
        // 410 — истекло время (5 минут) или токен уже использован
        setSession(null)
        toast.error(getApiErrorMessage(e, "Время на вход истекло — попробуйте ещё раз"))
      } finally {
        inFlight.current = false
      }
    }, POLL_INTERVAL)
    return () => clearInterval(timer)
  }, [session, poll, router])

  const begin = useCallback(async () => {
    // вкладку открываем синхронно в обработчике клика — после await браузер заблокирует попап
    const tab = window.open("", "_blank")
    try {
      const { token, url } = await start().unwrap()
      if (tab) tab.location.href = url
      else window.location.href = url
      setSession({ token, url })
    } catch (e) {
      tab?.close()
      toast.error(getApiErrorMessage(e, "Вход через Telegram сейчас недоступен"))
    }
  }, [start])

  return { begin, cancel, starting, waitingUrl: session?.url ?? null }
}
