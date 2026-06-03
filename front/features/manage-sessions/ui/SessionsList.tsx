"use client"

import { toast } from "sonner"
import { MonitorSmartphone } from "lucide-react"
import { Button, Skeleton } from "@/shared/ui"
import { useGetSessionsQuery, useRevokeOtherSessionsMutation } from "@/entities/user"

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
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

  const otherCount = sessions.length - 1

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {sessions.map((session, i) => (
          <div
            key={session.id}
            className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
          >
            <MonitorSmartphone strokeWidth={1.5} className="size-4 shrink-0 text-muted-foreground" />
            <div className="flex flex-col gap-0.5 flex-1 min-w-0">
              <span className="text-sm font-medium">
                {i === 0 ? `${session.deviceName} — текущая` : session.deviceName}
              </span>
              <span className="text-xs text-muted-foreground">
                Вход {formatDate(session.createdAt)}
              </span>
            </div>
            {i === 0 && (
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                активна
              </span>
            )}
          </div>
        ))}
      </div>

      {otherCount > 0 && (
        <Button
          variant="outline"
          size="sm"
          className="w-fit text-destructive border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
          onClick={handleRevoke}
          disabled={revoking}
        >
          {revoking ? "Завершаем..." : `Завершить другие сессии (${otherCount})`}
        </Button>
      )}
    </div>
  )
}
