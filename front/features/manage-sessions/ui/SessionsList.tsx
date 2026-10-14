"use client"

import { toast } from "sonner"
import { MonitorSmartphone } from "lucide-react"
import { Button, Skeleton } from "@/shared/ui"
import { useGetSessionsQuery, useRevokeOtherSessionsMutation } from "@/entities/user"

// ~2.5 строки: половинка третьей показывает, что список скроллится
const LIST_MAX_HEIGHT = "max-h-[10.5rem]"
// тень снизу, пока есть что скроллить: «крышка» цвета карточки едет с контентом (local) и в конце закрывает тень (scroll)
const SCROLL_SHADOW =
  "[background:linear-gradient(transparent,var(--card)_70%)_0_100%/100%_24px_no-repeat_local,linear-gradient(to_top,rgb(0_0_0/0.06),transparent)_0_100%/100%_14px_no-repeat_scroll]"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function SessionRow({ session }: { session: { id: string; deviceName: string; createdAt: string; isCurrent: boolean } }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5">
      <MonitorSmartphone strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" />
      <div className="flex flex-col gap-0.5 flex-1 min-w-0">
        <span className="text-sm font-medium">{session.deviceName}</span>
        <span className="text-xs text-muted-foreground">
          Вход {formatDate(session.createdAt)}
        </span>
      </div>
      {session.isCurrent && (
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
          активна
        </span>
      )}
    </div>
  )
}

export function SessionsList() {
  const { data: sessions, isLoading } = useGetSessionsQuery()
  const [revokeOthers, { isLoading: revoking }] = useRevokeOtherSessionsMutation()

  const handleRevoke = async () => {
    try {
      await revokeOthers().unwrap()
      toast.success("Все другие сессии завершены")
    } catch {
      toast.error("Не удалось завершить сессии")
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (!sessions?.length) return null

  const otherCount = sessions.filter((s) => !s.isCurrent).length

  return (
    <div className="flex h-full flex-col gap-3">
      <div className={`flex flex-col gap-2 overflow-y-auto overscroll-contain ${LIST_MAX_HEIGHT} ${SCROLL_SHADOW}`}>
        {sessions.map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}
      </div>

      {otherCount > 0 && (
        // mt-auto — кнопка у низа карточки, на одной линии с действиями соседних карточек
        <div className="mt-auto">
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
            onClick={handleRevoke}
            disabled={revoking}
          >
            {revoking ? "Завершаем..." : `Завершить другие (${otherCount})`}
          </Button>
        </div>
      )}
    </div>
  )
}
