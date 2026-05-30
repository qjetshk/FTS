"use client"

import { useState } from "react"
import { toast } from "sonner"
import { CheckCircle2, Search } from "lucide-react"
import {
  Popover, PopoverContent, PopoverTrigger,
  Button, Input,
} from "@/shared/ui"
import { useUpdateTnvedMutation, type TnvedAlternative } from "@/entities/product"
import { useLazySearchTnvedQuery } from "@/entities/tnved"
import type { TnvedItem } from "@/entities/tnved"
import { cn } from "@/shared/lib"

type Props = {
  productId: number
  clientId: number
  tnvedCode: string | null
  tnvedName: string | null
  alternatives: TnvedAlternative[]
  children: React.ReactNode
}

export function TnvedReviewPopover({ productId, clientId, tnvedCode, tnvedName, alternatives, children }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [updateTnved, { isLoading: saving }] = useUpdateTnvedMutation()
  const [searchTnved, { data: searchData, isFetching }] = useLazySearchTnvedQuery()

  const handleSearch = (q: string) => {
    setQuery(q)
    if (q.length >= 2) {
      searchTnved({ q, limit: 20 })
    }
  }

  const handleSelect = async (item: TnvedItem | TnvedAlternative) => {
    const code = "code" in item ? item.code : item.tnvedCode
    const name = "name" in item ? item.name : item.tnvedName
    const unit = "unit" in item ? item.unit : item.tnvedUnit

    try {
      await updateTnved({
        productId,
        clientId,
        tnvedCode: code,
        tnvedName: name ?? null,
        tnvedUnit: unit ?? null,
        tnvedStatus: "VERIFIED_BY_USER",
        tnvedAlternatives: [],
      }).unwrap()
      toast.success("ТН ВЭД код подтверждён")
      setOpen(false)
    } catch {
      toast.error("Не удалось сохранить")
    }
  }

  const searchResults = query.length >= 2 ? (searchData?.items ?? []) : []

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">
        <div className="p-3 border-b border-border">
          <p className="text-xs font-medium text-muted-foreground mb-2">Текущий код</p>
          <p className="text-sm font-mono">{tnvedCode} {tnvedName && `— ${tnvedName}`}</p>
        </div>

        {alternatives.length > 0 && (
          <div className="p-3 border-b border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Варианты от ИИ</p>
            <div className="flex flex-col gap-1">
              {alternatives.map((alt) => (
                <button
                  key={alt.id}
                  onClick={() => handleSelect(alt)}
                  disabled={saving}
                  className={cn(
                    "flex items-start gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors",
                    saving && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <CheckCircle2 className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <span>
                    <span className="font-mono font-medium">{alt.tnvedCode}</span>
                    {alt.tnvedName && <span className="text-muted-foreground"> — {alt.tnvedName}</span>}
                    {alt.tnvedUnit && <span className="text-muted-foreground"> ({alt.tnvedUnit})</span>}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="p-3">
          <div className="flex items-center gap-2 mb-2">
            <Search className="size-3.5 text-muted-foreground shrink-0" />
            <Input
              placeholder="Поиск по коду или названию..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              className="h-7 text-xs"
            />
          </div>

          {isFetching && <p className="text-xs text-muted-foreground text-center py-2">Ищем...</p>}

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.code}
                  onClick={() => handleSelect(item)}
                  disabled={saving}
                  className="flex items-start gap-2 w-full text-left px-2 py-1.5 rounded-md text-xs hover:bg-accent transition-colors"
                >
                  <span>
                    <span className="font-mono font-medium">{item.code}</span>
                    <span className="text-muted-foreground"> — {item.name}</span>
                    {item.unit && <span className="text-muted-foreground"> ({item.unit})</span>}
                  </span>
                </button>
              ))}
            </div>
          )}

          {query.length >= 2 && !isFetching && searchResults.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Ничего не найдено</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
