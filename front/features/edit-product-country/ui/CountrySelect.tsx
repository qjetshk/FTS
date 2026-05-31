"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Search } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger, Input } from "@/shared/ui"
import { useUpdateCountryMutation } from "@/entities/product"
import { cn } from "@/shared/lib"

type Props = {
  productId: number
  clientId: number
  countriesOfOrigin: string[]
  currentCountry: string | null
}

export function CountrySelect({ productId, clientId, countriesOfOrigin, currentCountry }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [updateCountry, { isLoading }] = useUpdateCountryMutation()

  useEffect(() => { if (!open) setQuery("") }, [open])

  const filtered = countriesOfOrigin.filter((c) =>
    c.toLowerCase().includes(query.toLowerCase())
  )

  const handleSelect = async (country: string) => {
    try {
      await updateCountry({ productId, clientId, country }).unwrap()
      setOpen(false)
    } catch {
      toast.error("Не удалось сохранить страну")
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded border cursor-pointer hover:bg-accent transition-colors",
          currentCountry ? "border-border" : "border-destructive/50 text-destructive"
        )}>
          {currentCountry ?? "Выбрать..."}
        </span>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-0" align="start">

        <div className="px-3 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Поиск страны..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-7 pl-7 text-xs"
              autoFocus
            />
          </div>
        </div>

        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">Ничего не найдено</p>
          )}
          {filtered.map((country) => (
            <button
              key={country}
              onClick={() => handleSelect(country)}
              disabled={isLoading}
              className={cn(
                "w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors border-b border-border/50 last:border-0",
                currentCountry === country && "font-medium text-primary",
                isLoading && "opacity-50 cursor-not-allowed"
              )}
            >
              {country}
            </button>
          ))}
        </div>

      </PopoverContent>
    </Popover>
  )
}
