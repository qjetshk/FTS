"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "./Button"
import { Popover, PopoverContent, PopoverTrigger } from "./Popover"

const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]
const MONTHS_FULL = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]

const toPeriod = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, "0")}`

type Props = {
  // 'YYYY-MM'
  value: string
  onChange: (period: string) => void
  // включительно, 'YYYY-MM'; месяцы вне диапазона недоступны
  min?: string
  max?: string
  disabled?: boolean
}

// Выбор месяца и года (без дней): кнопка «Сентябрь 2026» → сетка месяцев, стрелками листается год
export function MonthPicker({ value, onChange, min, max, disabled }: Props) {
  const [open, setOpen] = useState(false)
  const [valueYear, valueMonth] = value.split("-").map(Number)
  const [year, setYear] = useState(valueYear)

  const minYear = min ? Number(min.slice(0, 4)) : -Infinity
  const maxYear = max ? Number(max.slice(0, 4)) : Infinity
  const inRange = (p: string) => (!min || p >= min) && (!max || p <= max)

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next)
        // открываем на годе выбранного месяца, а не там, где листали в прошлый раз
        if (next) setYear(valueYear)
      }}
    >
      <PopoverTrigger
        render={
          <Button variant="outline" disabled={disabled} className="justify-start gap-2 font-normal">
            <CalendarDays strokeWidth={1.5} className="size-4 text-muted-foreground" />
            {MONTHS_FULL[valueMonth - 1]} {valueYear}
          </Button>
        }
      />
      <PopoverContent align="start" className="w-64">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Предыдущий год"
            disabled={year <= minYear}
            onClick={() => setYear((y) => y - 1)}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <span className="text-sm font-medium tabular-nums">{year}</span>
          <Button
            variant="ghost"
            size="icon-xs"
            aria-label="Следующий год"
            disabled={year >= maxYear}
            onClick={() => setYear((y) => y + 1)}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {MONTHS_SHORT.map((label, i) => {
            const p = toPeriod(year, i)
            const selected = p === value
            return (
              <Button
                key={label}
                variant={selected ? "default" : "ghost"}
                size="sm"
                aria-pressed={selected}
                disabled={!inRange(p)}
                onClick={() => {
                  onChange(p)
                  setOpen(false)
                }}
              >
                {label}
              </Button>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}
