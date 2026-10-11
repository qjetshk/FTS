import Link from "next/link"
import { AnimatePresence, motion } from "framer-motion"
import { AlertTriangle, PackageSearch } from "lucide-react"
import { AccordionItem, AccordionTrigger, AccordionContent, Badge } from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { formatPeriodTitle, isRunActive, RUN_STATUS } from "@/entities/statform"
import { StatFormTile } from "./StatFormTile"
import { RunProgress, RunStageLabel } from "./RunProgress"
import type { StatFormRun } from "@/entities/statform"

export function StatFormRunItem({ run }: { run: StatFormRun }) {
  const status = RUN_STATUS[run.status]
  const active = isRunActive(run.status)
  const fileCount = run.statForms.length

  return (
    <AccordionItem value={run.id}>
      <AccordionTrigger>
        <div className="flex items-center gap-3">
          <span>{formatPeriodTitle(run.period)}</span>
          {/* key по статусу → бейдж «выпрыгивает» при каждой смене */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={run.status}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
            >
              <Badge variant={status.variant}>{status.label}</Badge>
            </motion.span>
          </AnimatePresence>
          {active ? (
            <RunStageLabel stage={run.stage} />
          ) : (
            fileCount > 0 && (
              <span className="text-xs text-muted-foreground">
                {fileCount} {fileCount === 1 ? "файл" : fileCount < 5 ? "файла" : "файлов"}
              </span>
            )
          )}
        </div>
      </AccordionTrigger>

      <AccordionContent>
        <div className="flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {active && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RunProgress stage={run.stage} />
              </motion.div>
            )}
          </AnimatePresence>

          {run.status === "NEEDS_REVIEW" && (
            <div className="flex flex-wrap items-start gap-2 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
              <PackageSearch className="mt-0.5 size-4 shrink-0" />
              <span className="flex-1">{run.failureReason ?? "Проверьте коды ТН ВЭД у товаров из отправок"}</span>
              <Link href={ROUTES.products} className="font-medium underline underline-offset-4">
                К товарам
              </Link>
            </div>
          )}

          {run.status === "FAILED" && run.failureReason && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" />
              <span>{run.failureReason}</span>
            </div>
          )}

          {fileCount === 0 ? (
            !active && run.status !== "NEEDS_REVIEW" && <p className="text-sm text-muted-foreground">Нет файлов</p>
          ) : (
            <motion.div layout className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-4">
              <AnimatePresence initial={false}>
                {run.statForms.map((f) => (
                  <motion.div
                    key={f.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85, y: 8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ type: "spring", stiffness: 400, damping: 28 }}
                  >
                    <StatFormTile file={f} period={run.period} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  )
}
