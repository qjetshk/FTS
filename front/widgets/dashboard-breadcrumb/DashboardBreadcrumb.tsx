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
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-0.5 text-sm text-foreground transition-colors hover:bg-muted"
      >
        <Building2 strokeWidth={1.5} className="size-3.5 text-muted-foreground" />
        <span>{selected?.name ?? "Организации"}</span>
        <ChevronsUpDown strokeWidth={1.5} className="size-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-64 rounded-xl border border-border bg-popover shadow-md z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search strokeWidth={1.5} className="size-3.5 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="py-1 max-h-48 overflow-y-auto">
            {filtered.map((org) => (
              <button
                key={org.id}
                onClick={() => {
                  setSelected(org)
                  setOpen(false)
                  setSearch("")
                }}
                className="flex cursor-pointer items-center gap-2 w-full px-3 py-2 text-sm text-left hover:bg-muted transition-colors"
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
              </button>
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