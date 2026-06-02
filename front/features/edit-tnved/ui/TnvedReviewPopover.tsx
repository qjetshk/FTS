"use client"

import { useState, useRef, useCallback } from "react"
import { toast } from "sonner"
import { Search } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger, Input, Button } from "@/shared/ui"
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

const LIMIT = 20

export function TnvedReviewPopover({ productId, clientId, tnvedCode, tnvedName, alternatives, children }: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const pageRef = useRef(1)
  const [allItems, setAllItems] = useState<TnvedItem[]>([])
  const [hasMore, setHasMore] = useState(false)
  const loadingMore = useRef(false)

  const [updateTnved, { isLoading: saving }] = useUpdateTnvedMutation()
  const [searchTnved, { isFetching }] = useLazySearchTnvedQuery()

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

  const handleSelect = async (item: TnvedItem | TnvedAlternative) => {
    const code = "code" in item ? item.code : item.tnvedCode
    const name = "name" in item ? item.name : item.tnvedName
    const unit = "unit" in item ? item.unit : item.tnvedUnit
    try {
      await updateTnved({ productId, clientId, tnvedCode: code, tnvedName: name ?? null, tnvedUnit: unit ?? null, tnvedStatus: "VERIFIED_BY_USER", tnvedAlternatives: [] }).unwrap()
      toast.success("ТН ВЭД код подтверждён")
      setOpen(false)
    } catch {
      toast.error("Не удалось сохранить")
    }
  }

  const handleOpen = (v: boolean) => {
    setOpen(v)
    if (!v) { setQuery(""); setAllItems([]); pageRef.current = 1; setHasMore(false) }
  }

  return (
    <Popover open={open} onOpenChange={handleOpen}>
      <PopoverTrigger>{children}</PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="start">

        {/* Текущий код */}
        {tnvedCode && (
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground mb-0.5">Текущий</p>
            <p className="text-xs font-mono font-medium">{tnvedCode}{tnvedName && ` — ${tnvedName}`}</p>
          </div>
        )}

        {/* Варианты ИИ */}
        {alternatives.length > 0 && (
          <div className="px-3 py-2 border-b border-border">
            <p className="text-xs text-muted-foreground mb-1">Варианты ИИ</p>
            <div className="flex flex-col gap-0.5">
              {alternatives.map((alt) => (
                <Button variant="ghost" key={alt.id} onClick={() => handleSelect(alt)} disabled={saving}
                  className="w-full justify-start gap-1.5 px-2 py-1 h-auto text-xs">
                  <span className="font-mono font-medium shrink-0">{alt.tnvedCode}</span>
                  {alt.tnvedName && <span className="text-muted-foreground truncate">{alt.tnvedName}</span>}
                </Button>
              ))}
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

        {/* Результаты */}
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
          {allItems.map((item) => (
            <Button variant="ghost" key={item.code} onClick={() => handleSelect(item)} disabled={saving}
              className="w-full justify-start gap-1.5 px-3 py-1.5 h-auto text-xs border-b border-border/50 last:border-0 rounded-none">
              <span className="font-mono font-medium shrink-0">{item.code}</span>
              <span className="text-muted-foreground">{item.name}</span>
              {item.unit && <span className="text-muted-foreground shrink-0">({item.unit})</span>}
            </Button>
          ))}
          {isFetching && allItems.length > 0 && (
            <p className="text-xs text-muted-foreground text-center py-2">Загрузка...</p>
          )}
        </div>

      </PopoverContent>
    </Popover>
  )
}
