import { AlertTriangle } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent, Badge } from "@/shared/ui"
import { formatPeriodTitle, RUN_STATUS } from "@/entities/statform"
import { StatFormTile } from "./StatFormTile"
import type { StatFormRun } from "@/entities/statform"

export function StatFormRunItem({ run }: { run: StatFormRun }) {
  const status = RUN_STATUS[run.status]
  const fileCount = run.statForms.length

  return (
    <AccordionItem value={run.id}>
      <AccordionTrigger>
        <div className="flex items-center gap-3">
          <span>{formatPeriodTitle(run.period)}</span>
          <Badge variant={status.variant}>{status.label}</Badge>
          {fileCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {fileCount} {fileCount === 1 ? "файл" : fileCount < 5 ? "файла" : "файлов"}
            </span>
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent>
        {run.status === "FAILED" && run.failureReason && (
          <div className="mb-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <span>{run.failureReason}</span>
          </div>
        )}

        {run.statForms.length === 0 ? (
          <p className="text-sm text-muted-foreground">Нет файлов</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
            {run.statForms.map((f) => (
              <StatFormTile key={f.id} file={f} period={run.period} />
            ))}
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  )
}
