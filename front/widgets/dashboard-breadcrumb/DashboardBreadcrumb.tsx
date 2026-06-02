"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Building2, Check, ChevronsUpDown, Search } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { useGetAllOrgsQuery } from "@/entities/organization"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Дашборд",
  products: "Товары",
  statforms: "Статформы",
  organizations: "Организации",
  account: "Аккаунт",
  billing: "Биллинг",
  notifications: "Уведомления",
}

function OrgCrumb() {
  const { data: orgs = [] } = useGetAllOrgsQuery()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedId = searchParams?.get("orgId") ?? orgs[0]?.id
  const selectedOrg = orgs.find((o) => o.id === selectedId) ?? orgs[0]
  const name = selectedOrg?.fullOrg ?? "Организация"
  const shortName = name.length > 30 ? name.slice(0, 28) + "…" : name

  React.useEffect(() => {
    if (open) inputRef.current?.focus()
  }, [open])

  React.useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch("")
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [open])

  const orgHref = (id: string) => `${ROUTES.organizations}?orgId=${id}`

  // Одна орга — просто ссылка
  if (orgs.length <= 1) {
    return (
      <Link
        href={selectedOrg ? orgHref(selectedOrg.id) : ROUTES.organizations}
        className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors"
      >
        <Building2 strokeWidth={1.5} className="size-3.5 text-muted-foreground" />
        <span>{shortName}</span>
      </Link>
    )
  }

  // Несколько орг — дропдаун
  const filtered = orgs.filter(
    (o) =>
      o.fullOrg.toLowerCase().includes(search.toLowerCase()) ||
      o.inn.includes(search)
  )

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors"
      >
        <Building2 strokeWidth={1.5} className="size-3.5 text-muted-foreground" />
        <span>{shortName}</span>
        <ChevronsUpDown strokeWidth={1.5} className="size-3 text-muted-foreground" />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-72 rounded-xl border border-border bg-popover shadow-md z-50 overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <Search strokeWidth={1.5} className="size-3.5 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <div className="py-1 max-h-52 overflow-y-auto">
            {filtered.map((org) => (
              <Link
                key={org.id}
                href={orgHref(org.id)}
                onClick={() => { setOpen(false); setSearch("") }}
                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-accent transition-colors"
              >
                {org.id === selectedId
                  ? <Check strokeWidth={1.5} className="size-3.5 text-primary shrink-0" />
                  : <span className="size-3.5 shrink-0" />
                }
                <div className="min-w-0">
                  <div className="truncate">{org.fullOrg}</div>
                  <div className="text-xs text-muted-foreground">ИНН {org.inn}</div>
                </div>
              </Link>
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
                  <OrgCrumb />
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
