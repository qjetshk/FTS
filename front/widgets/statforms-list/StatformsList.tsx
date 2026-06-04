"use client"

import { FileSpreadsheet } from "lucide-react"
import { Accordion, Skeleton } from "@/shared/ui"
import { useGetStatformRunsQuery } from "@/entities/statform"
import { StatFormRunItem } from "./StatFormRunItem"

export function StatformsList() {
  const { data, isLoading } = useGetStatformRunsQuery()

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-muted-foreground">
        <FileSpreadsheet className="size-10 opacity-40" />
        <p className="text-sm">Статформы ещё не генерировались</p>
      </div>
    )
  }

  const sorted = [...data].sort((a, b) => b.period.localeCompare(a.period))
  const defaultOpen = sorted[0]?.id ? [sorted[0].id] : []

  return (
    <Accordion defaultValue={defaultOpen} multiple>
      {sorted.map((run) => (
        <StatFormRunItem key={run.id} run={run} />
      ))}
    </Accordion>
  )
}
