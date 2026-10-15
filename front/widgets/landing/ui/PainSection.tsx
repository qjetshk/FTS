"use client"

import { useRef } from "react"
import { m, useInView } from "framer-motion"
import { cn } from "@/shared/lib"
import { PAIN } from "../config/landing.data"
import { PainIllustration } from "./PainIllustration"
import { SectionHeading } from "./SectionHeading"

function PainCard({ item }: { item: (typeof PAIN)[number] }) {
  const ref = useRef<HTMLDivElement>(null)
  // карточка «загорается», пока она в средней части экрана
  const active = useInView(ref, { margin: "-25% 0px -25% 0px" })

  return (
    <m.div
      ref={ref}
      animate={{ opacity: active ? 1 : 0.55 }}
      transition={{ duration: 0.45 }}
      className={cn(
        "flex flex-col gap-6 rounded-2xl border bg-background p-7 sm:flex-row sm:items-center",
        active ? "border-primary shadow-[0_0_40px_-12px_rgb(22_163_74/0.45)]" : "border-border shadow-xs",
      )}
    >
      <div className="flex-1">
        <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary font-mono text-[13px] font-semibold text-primary-foreground">
          {item.n}
        </span>
        <h3 className="mt-4 text-xl leading-snug font-semibold text-foreground">{item.title}</h3>
        <p className="mt-2.5 text-[15px] leading-relaxed text-text-secondary">{item.body}</p>
      </div>
      <div className="flex shrink-0 justify-center">
        <PainIllustration kind={item.illo} active={active} />
      </div>
    </m.div>
  )
}

export function PainSection() {
  return (
    <section id="problem" className="scroll-mt-20 bg-surface py-20 sm:py-24">
      <SectionHeading title="Статформа Озон: каждый месяц — одно и то же" />
      <div className="mx-auto grid max-w-[1200px] gap-5 px-4 sm:px-6 lg:grid-cols-2">
        {PAIN.map((item) => (
          <PainCard key={item.n} item={item} />
        ))}
      </div>
    </section>
  )
}
