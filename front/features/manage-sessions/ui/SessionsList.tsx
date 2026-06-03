"use client"

import { useState } from "react"
import { toast } from "sonner"
import { MonitorSmartphone, ChevronDown } from "lucide-react"
import { m, AnimatePresence } from "framer-motion"
import { Button, Skeleton } from "@/shared/ui"
import { useGetSessionsQuery, useRevokeOtherSessionsMutation } from "@/entities/user"

const VISIBLE_COUNT = 3

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
  const [expanded, setExpanded] = useState(false)

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
  const hasMore = sessions.length > VISIBLE_COUNT
  const hiddenCount = sessions.length - VISIBLE_COUNT

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2">
        {/* Первые N — всегда видны */}
        {sessions.slice(0, VISIBLE_COUNT).map((s) => (
          <SessionRow key={s.id} session={s} />
        ))}

        {/* Остальные — появляются при expand */}
        <AnimatePresence initial={false}>
          {expanded && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="overflow-hidden flex flex-col gap-2"
            >
              {sessions.slice(VISIBLE_COUNT).map((s) => (
                <SessionRow key={s.id} session={s} />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground h-auto px-2 py-1 gap-1"
            onClick={() => setExpanded((v) => !v)}
          >
            <m.span
              animate={{ rotate: expanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="inline-flex"
            >
              <ChevronDown className="size-3.5" />
            </m.span>
            {expanded ? "Свернуть" : `Ещё ${hiddenCount}`}
          </Button>
        )}

        {otherCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="text-destructive border-destructive/40 hover:bg-destructive/5 hover:text-destructive"
            onClick={handleRevoke}
            disabled={revoking}
          >
            {revoking ? "Завершаем..." : `Завершить другие (${otherCount})`}
          </Button>
        )}
      </div>
    </div>
  )
}
