"use client"

import { useState } from "react"
import { m, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { cn } from "@/shared/lib"
import type { Product } from "@/entities/product"

type Props = {
  products: Product[]
  clientId: number
}

export function ProductsAttention({ products, clientId }: Props) {
  const [open, setOpen] = useState(true)

  const needsReview = products.filter((p) => p.tnvedStatus === "NEEDS_REVIEW")
  const countryIssue = products.filter((p) => p.tnvedStatus !== "NEEDS_REVIEW" && (p.countryConflict || !p.country))
  const green = products.filter((p) => !["NEEDS_REVIEW"].includes(p.tnvedStatus ?? "") && !p.countryConflict && p.country)

  if (needsReview.length === 0 && countryIssue.length === 0) return null

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-surface hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Требует внимания</span>
          <div className="flex items-center gap-2">
            {needsReview.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-800 font-medium">
                {needsReview.length} ТН ВЭД
              </span>
            )}
            {countryIssue.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">
                {countryIssue.length} страна
              </span>
            )}
            {green.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">
                {green.length} ок
              </span>
            )}
          </div>
        </div>
        <m.div animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="size-4 text-muted-foreground" />
        </m.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="divide-y divide-border">
              {needsReview.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 bg-yellow-50">
                  <span className="size-2 rounded-full bg-yellow-400 shrink-0" />
                  <span className="text-sm text-yellow-900 truncate flex-1">{p.name}</span>
                  <span className="text-xs text-yellow-700 shrink-0">ИИ классифицировал сам, требует проверки ТН ВЭД</span>
                </div>
              ))}
              {countryIssue.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-2.5 bg-red-50">
                  <span className="size-2 rounded-full bg-red-400 shrink-0" />
                  <span className="text-sm text-red-900 truncate flex-1">{p.name}</span>
                  <span className="text-xs text-red-700 shrink-0">
                    {p.countryConflict ? "Конфликт страны" : "Нет страны происхождения"}
                  </span>
                </div>
              ))}
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </div>
  )
}
