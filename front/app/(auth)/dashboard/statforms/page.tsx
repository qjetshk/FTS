import { Suspense } from "react"
import { StatformsList } from "@/widgets/statforms-list"
import { RunStatformsButton } from "@/features/run-statforms"

type Props = { searchParams: Promise<{ orgId?: string }> }

export default async function StatformsPage({ searchParams }: Props) {
  const { orgId } = await searchParams

  // Suspense — список и кнопка читают выбранную оргу из ?orgId= (useSearchParams).
  // key — при смене орги сбрасывается локальное состояние кнопки (кулдаун после 429 — на конкретную оргу)
  return (
    <Suspense>
      <div key={orgId ?? "default"} className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-foreground">Статформы</h1>
          <RunStatformsButton />
        </div>
        <StatformsList />
      </div>
    </Suspense>
  )
}
