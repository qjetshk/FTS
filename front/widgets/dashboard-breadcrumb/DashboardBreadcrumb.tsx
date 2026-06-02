"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Building2, Check, ChevronsUpDown, Search } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from "@/shared/ui"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Дашборд",
  products: "Товары",
  statforms: "Статформы",
  organizations: "Организации",
  account: "Аккаунт",
  billing: "Биллинг",
  notifications: "Уведомления",
}

// Stub — will be replaced with RTK Query
const STUB_ORGS = [
  { id: "1", name: "ООО Ромашка", inn: "7701234567" },
  { id: "2", name: "ИП Иванов А.С.", inn: "770987654321" },
]

type Org = (typeof STUB_ORGS)[number]

function OrgCombobox() {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const [selected, setSelected] = React.useState<Org | null>(null)
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const filtered = STUB_ORGS.filter(
    (org) =>
      org.name.toLowerCase().includes(search.toLowerCase()) ||
      org.inn.includes(search)
  )

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5 px-1.5 py-0.5 h-auto text-sm text-foreground"
      >
        <Building2 strokeWidth={1.5} className="size-3.5 text-muted-foreground" />
        <span>{selected?.name ?? "Организации"}</span>
        <ChevronsUpDown strokeWidth={1.5} className="size-3 text-muted-foreground" />
      </Button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-border bg-popover shadow-md z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search strokeWidth={1.5} className="size-3.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              aria-label="Поиск организации"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="py-1 max-h-48 overflow-y-auto">
            {filtered.map((org) => (
              <Button
                variant="ghost"
                key={org.id}
                onClick={() => {
                  setSelected(org)
                  setOpen(false)
                  setSearch("")
                }}
                className="w-full justify-start gap-2 px-3 py-2 h-auto text-sm"
              >
                {selected?.id === org.id ? (
                  <Check strokeWidth={1.5} className="size-3.5 text-primary shrink-0" />
                ) : (
                  <span className="size-3.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="truncate">{org.name}</div>
                  <div className="text-xs text-muted-foreground">{org.inn}</div>
                </div>
              </Button>
            ))}
            {filtered.length === 0 && (
              <p className="px-3 py-2 text-sm text-muted-foreground">Не найдено</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export function DashboardBreadcrumb() {
  const pathname = usePathname() ?? ""
  const segments = pathname.split("/").filter(Boolean)

  if (segments.length === 0) return null

  const crumbs = segments.map((seg, i) => ({
    label: SEGMENT_LABELS[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
    isOrg: seg === "organizations",
  }))

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                crumb.isOrg ? (
                  <OrgCombobox />
                ) : (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                )
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={crumb.href}>{crumb.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}