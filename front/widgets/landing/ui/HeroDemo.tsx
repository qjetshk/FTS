"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, m, useReducedMotion } from "framer-motion"
import { Check, CheckCheck, FileCode2 } from "lucide-react"
import { cn } from "@/shared/lib"
import { DEMO_COUNTRIES, DEMO_ROWS, type DemoCountry } from "../config/hero-demo.data"
import { LogoMark } from "./LogoMark"

const VISIBLE = 7
// строка на этой позиции «проверяется»; выше — уже разобранные
const SCAN = 3
const TICK_MS = 700
// после полного прохода отчёта сообщение «готово» висит столько тиков, потом всё сначала
const HOLD_TICKS = 7
const N = DEMO_ROWS.length

function positions(n: number) {
  if (n % 10 === 1 && n % 100 !== 11) return "позиция"
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return "позиции"
  return "позиций"
}

type State = { scroll: number; cycleTick: number; start: number }

function countsFor(state: State, full: boolean): Record<DemoCountry, number> {
  const counts: Record<DemoCountry, number> = { KZ: 0, BY: 0, AM: 0, KG: 0 }
  const done = full ? N : Math.min(state.cycleTick + 1, N)
  for (let k = 0; k < done; k++) {
    const c = DEMO_ROWS[(state.start + SCAN + k) % N].country
    if (c) counts[c]++
  }
  return counts
}

// Демо в hero: отчёт Ozon прокручивается через линию проверки, строки ЕАЭС подсвечиваются и набираются
// в файлы по странам в сообщении бота; в конце прохода — «статформы готовы». Без JS-анимаций при reduced motion
export function HeroDemo() {
  const reduce = useReducedMotion()
  const [state, setState] = useState<State>({ scroll: 0, cycleTick: 0, start: 0 })

  useEffect(() => {
    if (reduce) return
    const id = setInterval(() => {
      setState((s) => {
        const cycleTick = (s.cycleTick + 1) % (N + HOLD_TICKS)
        if (cycleTick === 0) return { scroll: s.scroll, cycleTick, start: s.scroll }
        return { ...s, cycleTick, scroll: cycleTick < N ? s.scroll + 1 : s.scroll }
      })
    }, TICK_MS)
    return () => clearInterval(id)
  }, [reduce])

  const done = !!reduce || state.cycleTick >= N - 1
  const counts = countsFor(state, done)
  const rows = Array.from({ length: VISIBLE }, (_, k) => ({ abs: state.scroll + k, k, row: DEMO_ROWS[(state.scroll + k) % N] }))

  return (
    <div className="flex w-full max-w-[640px] flex-col gap-4">
      {/* отчёт Ozon */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-3 text-xs text-green-100/60">
          <span className="font-mono">postings_2026-09.csv</span>
          <span>Отчёт Ozon, сентябрь</span>
        </div>
        <div className="relative h-[322px] overflow-hidden">
          {/* линия проверки */}
          <div className="pointer-events-none absolute inset-x-0 top-[138px] z-10 h-[46px] border-y border-green-300/40 bg-green-300/[0.06]" />
          <ul className="relative">
            <AnimatePresence initial={false} mode="popLayout">
              {rows.map(({ abs, k, row }) => {
                const scanned = reduce || k <= SCAN
                // подсвечиваем только строки текущего прохода — они же посчитаны в файлах ниже
                const counted = reduce || (abs - state.start - SCAN >= 0 && abs - state.start - SCAN <= state.cycleTick)
                const eaeu = row.country !== null && counted
                return (
                  <m.li
                    key={abs}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: scanned && !eaeu ? 0.35 : 1, y: 0 }}
                    exit={{ opacity: 0, transition: { duration: 0.12 } }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    className="grid h-[46px] grid-cols-[160px_1fr_auto] items-center gap-4 px-5 text-sm"
                  >
                    <span className="truncate font-mono text-xs text-green-100/45">{row.posting}</span>
                    <span className="truncate text-green-50/85">{row.product}</span>
                    <span
                      className={cn(
                        "rounded-md px-2 py-0.5 text-xs whitespace-nowrap",
                        eaeu && scanned ? "bg-green-300 font-semibold text-green-950" : "text-green-100/60",
                      )}
                    >
                      {eaeu && scanned ? `${row.country} ${row.cluster}` : row.cluster}
                    </span>
                  </m.li>
                )
              })}
            </AnimatePresence>
          </ul>
        </div>
      </div>

      {/* сообщение бота */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur-sm">
        <div className="flex gap-3">
          <LogoMark className="size-9 shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-sm font-semibold text-white">easyfts</span>
              <span className="flex items-center gap-1 text-[11px] text-green-100/50">
                1 октября, 06:00
                {done ? <CheckCheck className="size-3.5 text-green-300" /> : <Check className="size-3.5" />}
              </span>
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <m.p
                key={done ? "done" : "work"}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.25 }}
                className="mt-0.5 text-sm text-green-50/85"
              >
                {done ? "Статформы за сентябрь готовы, загрузите их в личный кабинет ФТС." : "Собираю статформы за сентябрь…"}
              </m.p>
            </AnimatePresence>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO_COUNTRIES.map(({ code, name }) => {
                const count = counts[code]
                const ready = count > 0
                return (
                  <m.div
                    key={code}
                    animate={{ opacity: ready ? 1 : 0.3, scale: ready ? 1 : 0.97 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                      "flex items-center gap-2.5 rounded-xl border px-3 py-2",
                      ready ? "border-green-300/30 bg-green-300/10" : "border-white/10",
                    )}
                  >
                    <FileCode2 className={cn("size-5 shrink-0", ready ? "text-green-300" : "text-green-100/40")} />
                    <div className="min-w-0 leading-tight">
                      <p className="font-mono text-[13px] font-medium text-white">{code}.xml</p>
                      <p className="truncate text-[11px] text-green-100/55">
                        {name}, {count} {positions(count)}
                      </p>
                    </div>
                  </m.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
