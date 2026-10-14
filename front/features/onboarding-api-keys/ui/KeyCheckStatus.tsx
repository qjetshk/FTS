import { CheckCircle2, Loader2, XCircle } from "lucide-react"
import type { KeyCheckState } from "../lib/use-key-check.lib"

const VIEW = {
  checking: { text: "Проверяем ключ", className: "text-muted-foreground", Icon: Loader2, iconClass: "animate-spin" },
  valid: { text: "Ключ валиден", className: "text-green-600", Icon: CheckCircle2, iconClass: "" },
  error: { text: "Ошибка ключа", className: "text-destructive", Icon: XCircle, iconClass: "" },
} as const

// Статус проверки ключа справа от заголовка поля; пока поля не заполнены — ничего не показываем
export function KeyCheckStatus({ state }: { state: KeyCheckState }) {
  if (state.status === "idle") return null
  const { text, className, Icon, iconClass } = VIEW[state.status]
  return (
    <span role="status" className={`flex items-center gap-1 text-xs font-medium ${className}`}>
      {text}
      <Icon strokeWidth={2} className={`size-3.5 ${iconClass}`} />
    </span>
  )
}
