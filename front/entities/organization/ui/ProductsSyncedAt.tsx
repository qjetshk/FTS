import { RefreshCw } from "lucide-react"

const formatter = new Intl.DateTimeFormat("ru-RU", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

type Props = {
  syncedAt: string | null
}

export function ProductsSyncedAt({ syncedAt }: Props) {
  return (
    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <RefreshCw strokeWidth={1.5} className="size-3.5" />
      {syncedAt ? `Синхронизировано ${formatter.format(new Date(syncedAt))}` : "Ещё не синхронизировано"}
    </span>
  )
}
