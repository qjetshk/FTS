"use client"

import { useState, useRef, useCallback } from "react"
import { Check, Search } from "lucide-react"
import {
  Popover, PopoverContent, PopoverTrigger,
  Input, Button,
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger,
} from "@/shared/ui"
import { type TnvedAlternative } from "@/entities/product"
import { useLazySearchTnvedQuery } from "@/entities/tnved"
import type { TnvedItem } from "@/entities/tnved"
import { cn } from "@/shared/lib"

type Props = {
  tnvedCode: string | null
  tnvedName: string | null
  tnvedUnit: string | null
  alternatives: TnvedAlternative[]
  pendingCode?: string | null
  pendingName?: string | null
  onSelect: (code: string, name: string | null, unit: string | null) => void
  children: React.ReactNode
}

type AltEntry = { id: string; code: string; name: string | null; unit: string | null }

const LIMIT = 20

function CodeName({ name, side = "right" }: { name: string; side?: "right" | "bottom" }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger render={<span />} className="text-muted-foreground truncate min-w-0">
          {name}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs text-xs whitespace-normal">
          {name}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export function TnvedReviewPopover({
  tnvedCode, tnvedName, tnvedUnit,
  alternatives,
  pendingCode, pendingName,
  onSelect, children,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const pageRef = useRef(1)
  const [allItems, setAllItems] = useState<TnvedItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const loadingMore = useRef(false)

  const [searchTnved, { isFetching }] = useLazySearchTnvedQuery()

  // Main AI code + alternatives merged into one list
  const allAlts: AltEntry[] = [
    ...(tnvedCode ? [{ id: "__main__", code: tnvedCode, name: tnvedName, unit: tnvedUnit }] : []),
    ...alternatives.map(a => ({ id: a.id, code: a.tnvedCode, name: a.tnvedName, unit: a.tnvedUnit })),
  ]

  // Which code is currently active (pending selection takes priority)
  const activeCode = pendingCode ?? tnvedCode

  const doSearch = useCallback(async (q: string, pg: number, append = false) => {
    if (q.length < 2) { setAllItems([]); setHasMore(false); return }
    const result = await searchTnved({ q, page: pg, limit: LIMIT }).unwrap().catch(() => null)
    if (!result) return
    setAllItems(prev => append ? [...prev, ...result.items] : result.items)
    setHasMore(result.items.length === LIMIT)
  }, [searchTnved])

  const handleQueryChange = (q: string) => {
    setQuery(q)
    pageRef.current = 1
    doSearch(q, 1, false)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget
    if (el.scrollHeight - el.scrollTop - el.clientHeight < 60 && hasMore && !isFetching && !loadingMore.current) {
      loadingMore.current = true
      const nextPage = pageRef.current + 1
      pageRef.current = nextPage
      doSearch(query, nextPage, true).finally(() => { loadingMore.current = false })
    }
  }

  const handleOpen = (v: boolean) => {
    setOpen(v)
    if (!v) { setQuery(""); setAllItems([]); pageRef.current = 1; setHasMore(false) }
  }

  const pick = (code: string, name: string | null, unit: string | null) => {
    onSelect(code, name, unit)
    setOpen(false)
  }

  // What to show in the "current" header
  const currentCode = pendingCode ?? tnvedCode
  const currentName = pendingCode ? (pendingName ?? null) : tnvedName
  const currentLabel = pendingCode ? "Выбрано" : "Текущий"

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger render={children as React.ReactElement} />
      <PopoverContent className="w-96 p-0" align="start">

        {/* Текущий / Выбрано */}
        {currentCode && (
          <div className="px-3 py-2 border-b border-border">
            <p className={cn("text-xs mb-0.5", pendingCode ? "text-blue-600 font-medium" : "text-muted-foreground")}>
              {currentLabel}
            </p>
            <p className="text-xs font-mono font-medium">
              {currentCode}{currentName && ` — ${currentName}`}
            </p>
          </div>
        )}

        {/* Варианты ИИ (includes main code as first item) */}
        {allAlts.length > 0 && (
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1">Варианты ИИ</p>
            <div className="flex flex-col gap-0.5">
              {allAlts.map((alt) => {
                const isActive = alt.code === activeCode
                return (
                  <Button
                    variant="ghost"
                    key={alt.id}
                    onClick={() => pick(alt.code, alt.name, alt.unit)}
                    className={cn(
                      "w-full justify-start gap-1.5 px-2 py-1 h-auto text-xs",
                      isActive && "bg-primary/5"
                    )}
                  >
                    {isActive
                      ? <Check className="size-3 shrink-0 text-primary" />
                      : <span className="size-3 shrink-0" />
                    }
                    <span className="font-mono font-medium shrink-0">{alt.code}</span>
                    {alt.name && <CodeName name={alt.name} />}
                  </Button>
                )
              })}
            </div>
          </div>
        )}

        {/* Поиск */}
        <div className="px-3 py-2 border-b border-border">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              placeholder="Поиск по коду или названию..."
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              className="h-7 pl-7 text-xs"
              autoFocus
            />
          </div>
        </div>

        {/* Результаты поиска */}
        <div className="max-h-52 overflow-y-auto" onScroll={handleScroll}>
          {isFetching && allItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">Ищем...</p>
          )}
          {query.length >= 2 && !isFetching && allItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">Ничего не найдено</p>
          )}
          {query.length < 2 && allItems.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-3">Введите минимум 2 символа</p>
          )}
          {allItems.map((item) => {
            const isActive = item.code === activeCode
            return (
              <Button
                variant="ghost"
                key={item.code}
                onClick={() => pick(item.code, item.name, item.unit)}
                className={cn(
                  "w-full justify-start gap-1.5 px-3 py-1.5 h-auto text-xs border-b border-border/50 last:border-0 rounded-none",
                  isActive && "bg-primary/5"
                )}
              >
                {isActive
                  ? <Check className="size-3 shrink-0 text-primary" />
                  : <span className="size-3 shrink-0" />
                }
                <span className="font-mono font-medium shrink-0">{item.code}</span>
                <CodeName name={item.name} side="bottom" />
                {item.unit && <span className="text-muted-foreground shrink-0 ml-auto">({item.unit})</span>}
              </Button>
            )
          })}
          {isFetching && allItems.length > 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Загрузка...</p>
          )}
        </div>

      </PopoverContent>
    </Popover>
  )
}
