"use client"

import { motion } from "framer-motion"
import { cn } from "@/shared/lib"

const STEPS = [
  { n: 1, label: "API-ключи" },
  { n: 2, label: "Организация" },
  { n: 3, label: "Товары" },
]

export function Stepper({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, i) => {
        const done = current > step.n
        const active = current === step.n

        return (
          <div key={step.n} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                animate={{
                  backgroundColor: done || active ? "var(--primary)" : "var(--border)",
                  scale: active ? 1.1 : 1,
                }}
                transition={{ duration: 0.25 }}
                className="flex size-8 items-center justify-center rounded-full text-sm font-semibold text-white"
              >
                {done ? (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7l4 4 6-6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : (
                  step.n
                )}
              </motion.div>
              <span className={cn("text-xs whitespace-nowrap", active ? "text-foreground font-medium" : "text-muted-foreground")}>
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && (
              <motion.div
                animate={{ backgroundColor: done ? "var(--primary)" : "var(--border)" }}
                transition={{ duration: 0.25 }}
                className="h-px w-16 mb-5 mx-2"
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
