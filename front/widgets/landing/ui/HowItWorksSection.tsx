"use client"

import { m } from "framer-motion"
import { STEPS } from "../config/landing.data"
import { SectionHeading } from "./SectionHeading"

export function HowItWorksSection() {
  return (
    <section id="how" className="scroll-mt-20 bg-background py-20 sm:py-24">
      <SectionHeading
        title="Шесть шагов — и статформа сдана"
        lead="Настройка один раз за 5 минут — дальше сервис работает сам."
      />
      <ol className="mx-auto grid max-w-[1200px] gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        {STEPS.map((step, i) => (
          <m.li
            key={step.n}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.45, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col rounded-2xl border border-border bg-surface p-7"
          >
            <div className="mb-5 flex items-center gap-3.5">
              <span className="inline-flex size-9 items-center justify-center rounded-lg bg-primary font-mono text-[13px] font-bold text-primary-foreground">
                {step.n}
              </span>
              <step.icon className="size-5 text-text-muted" />
            </div>
            <h3 className="mb-2.5 text-xl leading-snug font-semibold text-foreground">{step.title}</h3>
            <p className="text-[15px] leading-relaxed text-text-secondary">{step.body}</p>
          </m.li>
        ))}
      </ol>
    </section>
  )
}
