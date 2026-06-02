"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger, Input, Button } from "@/shared/ui"
import { FTS_COUNTRIES } from "@/shared/config"
import { cn } from "@/shared/lib"

type Props = {
  productId: number
  currentCountry: string | null // effective value (pending ?? server)
  isPending?: boolean
  onSelect: (country: string) => void // called with toUpperCase country name
}

export function CountrySelect({ productId: _productId, currentCountry, isPending, onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")

  const handleOpenChange = (v: boolean) => {
    setOpen(v)
    if (!v) setQuery("")
  }

  const q = query.trim().toLowerCase()
  const filtered = q
    ? FTS_COUNTRIES.filter(
        (c) => c.name.toLowerCase().includes(q) || c.alpha2.toLowerCase().includes(q)
      )
    : FTS_COUNTRIES

  const isActive = (name: string) =>
    currentCountry?.toUpperCase() === name.toUpperCase()

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded border cursor-pointer hover:bg-accent transition-colors truncate max-w-full block",
          isPending ? "border-blue-300 text-blue-600 font-medium" : currentCountry ? "border-border" : "border-destructive/50 text-destructive"
        )}>
          {isPending && <span className="inline-block size-1.5 rounded-full bg-blue-500 mr-1 mb-0.5 shrink-0" />}
          {currentCountry ?? "Выбрать..."}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-0" align="start">

        <div className="px-3 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Название или код (RU, CN…)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-7 pl-7 text-xs"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-56 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">Ничего не найдено</p>
          )}
          {filtered.map((country) => (
            <Button
              variant="ghost"
              key={country.alpha2}
              onClick={() => { onSelect(country.name); setOpen(false) }}
              className={cn(
                "w-full justify-start gap-2 px-3 py-1.5 h-auto text-xs rounded-none border-b border-border/50 last:border-0",
                isActive(country.name) && "font-medium text-primary"
              )}
            >
              <span className="font-mono text-muted-foreground shrink-0 w-6">{country.alpha2}</span>
              <span className="truncate">{country.name}</span>
            </Button>
          ))}
        </div>

      </PopoverContent>
    </Popover>
  )
}
