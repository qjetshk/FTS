"use client"

import { m } from "framer-motion"
import { STATS } from "../config/landing.data"
import { SectionHeading } from "./SectionHeading"

export function StatsSection() {
  return (
    <section className="bg-surface py-20 sm:py-24">
      <SectionHeading title="Цифры, которые важны" />
      <dl className="mx-auto grid max-w-[1200px] gap-x-12 gap-y-10 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        {STATS.map((stat, i) => (
          <m.div
            key={stat.value}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.5 }}
            transition={{ duration: 0.7, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
          >
            <dt className="text-4xl leading-none font-bold tracking-tight text-primary tabular-nums sm:text-5xl">{stat.value}</dt>
            <dd className="mt-4 max-w-[260px] text-[15px] leading-normal text-text-secondary">{stat.label}</dd>
          </m.div>
        ))}
      </dl>
    </section>
  )
}
