// Минимум из Telegram WebApp API (telegram-web-app.js), который нам нужен
type TelegramWebApp = {
  initData: string
  ready: () => void
  expand: () => void
}

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp }
  }
}

export function getTelegramWebApp(): TelegramWebApp | null {
  return typeof window === "undefined" ? null : (window.Telegram?.WebApp ?? null)
}

// initData: из SDK, а если скрипт ещё не загрузился — из hash, куда его кладёт сам Telegram (#tgWebAppData=…)
export function getInitData(): string {
  const fromSdk = getTelegramWebApp()?.initData
  if (fromSdk) return fromSdk
  if (typeof window === "undefined") return ""
  return new URLSearchParams(window.location.hash.slice(1)).get("tgWebAppData") ?? ""
}
