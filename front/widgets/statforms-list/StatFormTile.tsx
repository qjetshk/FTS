"use client"

import { useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { FileText, Download, AlertCircle, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/shared/lib"
import { countryName, FILE_STATUS } from "@/entities/statform"
import { downloadStatform } from "@/features/download-statform"
import { Badge } from "@/shared/ui"
import type { StatForm } from "@/entities/statform"

export function StatFormTile({ file }: { file: StatForm }) {
  const [hover, setHover] = useState(false)
  const [busy, setBusy] = useState(false)
  const ready = file.status === "READY"
  const building = file.status === "BUILDING"

  async function handleDownload() {
    if (!ready || busy) return
    setBusy(true)
    try {
      await downloadStatform(file.id, `${file.country}_statform.xml`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Ошибка скачивания")
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
      onClick={handleDownload}
      disabled={!ready || busy}
      className={cn(
        "relative flex size-40 flex-col items-center justify-center rounded-xl border border-border bg-surface p-3 transition-colors outline-none",
        ready && !busy && "cursor-pointer hover:border-primary/50 hover:bg-surface",
        (!ready || busy) && "cursor-not-allowed",
        file.status === "FAILED" && "opacity-60",
      )}
    >
      {/* статус не-READY в углу */}
      {file.status !== "READY" && (
        <span className="absolute top-2 right-2">
          <Badge variant={FILE_STATUS[file.status].variant}>
            {FILE_STATUS[file.status].label}
          </Badge>
        </span>
      )}

      {/* дефолтный контент */}
      <motion.div
        animate={{ opacity: hover && ready ? 0 : 1 }}
        transition={{ duration: 0.15 }}
        className="flex flex-col items-center gap-3 pointer-events-none"
      >
        {building ? (
          <Loader2 className="size-10 text-muted-foreground animate-spin" />
        ) : file.status === "FAILED" ? (
          <AlertCircle className="size-10 text-destructive" />
        ) : (
          <FileText className="size-10 text-muted-foreground" />
        )}
        <span className="text-sm font-medium text-foreground leading-tight text-center">
          {countryName(file.country)}
        </span>
        {file.itemsCount > 0 && (
          <span className="text-xs text-muted-foreground">{file.itemsCount} тов.</span>
        )}
      </motion.div>

      {/* hover-оверлей со скачиванием */}
      <AnimatePresence>
        {hover && ready && !busy && (
          <motion.div
            initial={{ opacity: 0, scale: 0.75 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.75 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none"
          >
            <Download className="size-10 text-[var(--success-fg)]" />
          </motion.div>
        )}
        {busy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <Loader2 className="size-10 text-[var(--success-fg)] animate-spin" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
