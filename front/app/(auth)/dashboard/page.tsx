"use client"

import { Building2, Package, FileText } from "lucide-react"
import { useGetStatsQuery } from "@/entities/user"
import { Card, CardContent, Skeleton } from "@/shared/ui"

const STATS = [
  { key: "organizations" as const, label: "Организации", icon: Building2 },
  { key: "products" as const, label: "Товары", icon: Package },
  { key: "statforms" as const, label: "Статформы", icon: FileText },
]

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetStatsQuery()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold text-foreground">Дашборд</h1>

      <div className="grid grid-cols-3 gap-4">
        {STATS.map(({ key, label, icon: Icon }) => (
          <Card key={key}>
            <CardContent className="flex items-center gap-4 pt-5 pb-5">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon strokeWidth={1.5} className="size-5 text-primary" />
              </div>
              <div className="flex flex-col gap-0.5">
                {isLoading ? (
                  <Skeleton className="h-6 w-10" />
                ) : (
                  <span className="text-2xl font-semibold tabular-nums">
                    {stats?.[key] ?? 0}
                  </span>
                )}
                <span className="text-sm text-muted-foreground">{label}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
