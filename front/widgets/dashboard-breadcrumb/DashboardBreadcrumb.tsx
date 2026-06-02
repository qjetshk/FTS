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
import { useGetAllOrgsQuery, useGetFirstOrgQuery } from "@/entities/organization"

const SEGMENT_LABELS: Record<string, string> = {
  dashboard: "Дашборд",
  products: "Товары",
  statforms: "Статформы",
  organizations: "Организации",
  account: "Аккаунт",
  billing: "Биллинг",
  notifications: "Уведомления",
}

// Страницы где нужен выбор орги в бредкрамбе
const ORG_SCOPED = new Set(["products", "statforms", "organizations"])

// Базовый URL для каждой org-scoped страницы
const ORG_PAGE_BASE: Record<string, string> = {
  products: ROUTES.products,
  statforms: ROUTES.statforms,
  organizations: ROUTES.organizations,
}

type OrgCrumbProps = {
  pageBase: string  // куда навигировать при выборе
}

function OrgCrumb({ pageBase }: OrgCrumbProps) {
  const { data: orgs = [] } = useGetAllOrgsQuery()
  const { data: firstOrg } = useGetFirstOrgQuery()
  const searchParams = useSearchParams()
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")
  const ref = React.useRef<HTMLDivElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)

  const selectedId = searchParams?.get("orgId") ?? orgs[0]?.id
  const selectedOrg = orgs.find((o) => o.id === selectedId) ?? orgs[0]
  const name = selectedOrg?.fullOrg ?? firstOrg?.fullOrg ?? "Организация"

  const orgHref = (id: string) => `${pageBase}?orgId=${id}`

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

  // Одна орга — ссылка без шеврона
  if (orgs.length <= 1) {
    return (
      <Link
        href={selectedOrg ? orgHref(selectedOrg.id) : pageBase}
        className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors min-w-0 max-w-56"
      >
        <Building2 strokeWidth={1.5} className="size-3.5 text-muted-foreground shrink-0" />
        <span className="truncate">{name}</span>
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
    <div ref={ref} className="relative min-w-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 px-1.5 py-0.5 rounded-md text-sm text-foreground hover:bg-accent transition-colors max-w-56"
      >
        <Building2 strokeWidth={1.5} className="size-3.5 text-muted-foreground shrink-0" />
        <span className="truncate">{name}</span>
        <ChevronsUpDown strokeWidth={1.5} className="size-3 text-muted-foreground shrink-0" />
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
    seg,
    label: SEGMENT_LABELS[seg] ?? seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
    isLast: i === segments.length - 1,
  }))

  const lastSeg = crumbs[crumbs.length - 1]?.seg ?? ""
  const isOrgScoped = ORG_SCOPED.has(lastSeg)
  const pageBase = ORG_PAGE_BASE[lastSeg] ?? ""

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {crumbs.map((crumb, i) => (
          <React.Fragment key={crumb.href}>
            {i > 0 && <BreadcrumbSeparator />}
            <BreadcrumbItem>
              {crumb.isLast ? (
                <>
                  {/* Для organizations — OrgCrumb как последний элемент */}
                  {crumb.seg === "organizations" ? (
                    <OrgCrumb pageBase={pageBase} />
                  ) : isOrgScoped ? (
                    // Для products/statforms — OrgCrumb + сепаратор + название страницы
                    <>
                      <OrgCrumb pageBase={pageBase} />
                      <BreadcrumbSeparator />
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    </>
                  ) : (
                    <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                  )}
                </>
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
