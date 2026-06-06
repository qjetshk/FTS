"use client"

import * as React from "react"
import { useState } from "react"
import { ChevronsUpDown } from "lucide-react"
import {
  FormItem, FormLabel, FormMessage,
  Popover, PopoverContent, PopoverTrigger,
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/shared/ui"
import { cn } from "@/shared/lib"
import { DOCUMENT_TYPES } from "../model/document-types.data"

type Props = {
  field: { value: string; onChange: (...event: unknown[]) => void }
  fieldState: { error?: unknown }
  onValueChange: (short: string) => void
}

export function DocTypeSelect({ field, fieldState, onValueChange }: Props) {
  const [open, setOpen] = useState(false)
  const scrollY = React.useRef(0)

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) scrollY.current = window.scrollY
    setOpen(newOpen)
    if (newOpen) requestAnimationFrame(() => window.scrollTo(0, scrollY.current))
  }

  const selected = DOCUMENT_TYPES.find((d) => d.code === field.value)

  return (
    <FormItem className="col-span-2">
      <FormLabel>Тип документа</FormLabel>
      <Popover open={open} onOpenChange={handleOpenChange}>
        <PopoverTrigger
          className={cn(
            "flex h-9 w-full items-center justify-between rounded-md border bg-transparent px-3 py-2 text-sm shadow-sm transition-colors",
            fieldState.error ? "border-destructive" : "border-input",
            !selected && "text-muted-foreground"
          )}
        >
          {selected ? selected.name : "Выберите тип..."}
          <ChevronsUpDown className="size-4 opacity-50 shrink-0 ml-2" />
        </PopoverTrigger>
        <PopoverContent className="w-(--anchor-width) min-w-80 p-0" align="start">
          <Command className="bg-background">
            <CommandInput placeholder="Поиск..." autoFocus={false} />
            <CommandList className="max-h-60">
              <CommandEmpty>Ничего не найдено</CommandEmpty>
              <CommandGroup>
                {DOCUMENT_TYPES.map((d) => (
                  <CommandItem
                    key={d.code}
                    value={`${d.name} ${d.short} ${d.code}`}
                    data-checked={field.value === d.code}
                    className="data-selected:bg-transparent data-selected:text-foreground cursor-pointer hover:bg-accent rounded-sm"
                    onSelect={() => {
                      field.onChange(d.code)
                      onValueChange(d.short)
                      setOpen(false)
                    }}
                  >
                    {d.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )
}
