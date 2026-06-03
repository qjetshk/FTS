import { StatformsList } from "@/widgets/statforms-list"
import { RunStatformsButton } from "@/features/run-statforms"

export default function StatformsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">Статформы</h1>
        <RunStatformsButton />
      </div>
      <StatformsList />
    </div>
  )
}
