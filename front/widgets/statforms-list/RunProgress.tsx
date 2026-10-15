"use client"

import { AnimatePresence, m } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/shared/lib"
import { RUN_STAGES, type StatFormRunStage } from "@/entities/statform"

const EASE = [0.16, 1, 0.3, 1] as const

// Индикатор шагов генерации: полоса заполняется по мере смены этапа, у текущего шага пульсирует кольцо
export function RunProgress({ stage }: { stage: StatFormRunStage | null }) {
  const current = Math.max(0, RUN_STAGES.findIndex((s) => s.stage === stage))
  const progress = (current + 1) / RUN_STAGES.length

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface px-4 py-3">
      <div className="h-1 w-full overflow-hidden rounded-full bg-border">
        {/* scaleX вместо width — без пересчёта раскладки на каждом кадре */}
        <m.div
          className="h-full w-full origin-left rounded-full bg-primary"
          initial={false}
          animate={{ scaleX: progress }}
          transition={{ duration: 0.6, ease: EASE }}
        />
      </div>

      <ol className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
        {RUN_STAGES.map((s, i) => {
          const done = i < current
          const active = i === current
          return (
            <li key={s.stage} className="flex items-center gap-2 min-w-0">
              <span className="relative flex size-4 shrink-0 items-center justify-center">
                <AnimatePresence mode="wait" initial={false}>
                  {done ? (
                    <m.span
                      key="done"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 25 }}
                      className="flex size-4 items-center justify-center rounded-full bg-primary"
                    >
                      <Check className="size-2.5 text-primary-foreground" strokeWidth={3} />
                    </m.span>
                  ) : (
                    // пульс — CSS-кольцо, а не animate с repeat: AnimatePresence initial={false} отключал анимацию
                    // у точки, которая уже на экране при первом рендере (страницу открыли посреди генерации)
                    <m.span key="dot" className="relative flex size-2" exit={{ opacity: 0 }}>
                      {active && (
                        <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60 motion-reduce:animate-none" />
                      )}
                      <span className={cn("relative inline-flex size-2 rounded-full", active ? "bg-primary" : "bg-border")} />
                    </m.span>
                  )}
                </AnimatePresence>
              </span>
              <span
                className={cn(
                  "truncate text-xs",
                  active ? "font-medium text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/60",
                )}
              >
                {s.label}
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

// Текущий шаг одной строкой (в заголовке аккордеона) — плавно сменяется при переходе
export function RunStageLabel({ stage }: { stage: StatFormRunStage | null }) {
  const label = RUN_STAGES.find((s) => s.stage === stage)?.label ?? "В очереди"
  return (
    <span className="relative inline-flex h-4 overflow-hidden text-xs text-muted-foreground">
      <AnimatePresence mode="popLayout" initial={false}>
        <m.span
          key={label}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {label}…
        </m.span>
      </AnimatePresence>
    </span>
  )
}
