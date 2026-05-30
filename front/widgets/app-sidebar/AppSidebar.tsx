"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import {
  ChevronRight,
  ChevronsUpDown,
  CircleUser,
  CreditCard,
  Bell,
  LogOut,
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarSeparator,
  useSidebar,
} from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib"
import { NAV_ITEMS } from "./nav.data"

function Logo() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
        Ф
      </div>
      {!collapsed && (
        <span className="font-semibold text-sm text-sidebar-foreground truncate">easyfts</span>
      )}
    </div>
  )
}

function NavItems() {
  const rawPathname = usePathname()
  const pathname = rawPathname ?? ""
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const [openSub, setOpenSub] = React.useState<string | null>(() => {
    const orgItem = NAV_ITEMS.find((i) => i.children)
    if (orgItem && pathname.startsWith(orgItem.url)) return orgItem.url
    return null
  })

  return (
    <SidebarMenu>
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.url || (item.url !== ROUTES.dashboard && pathname.startsWith(item.url + "/"))
        const isSubOpen = openSub === item.url

        if (item.children) {
          return (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                isActive={isActive}
                tooltip={item.title}
                onClick={() => setOpenSub(isSubOpen ? null : item.url)}
              >
                <item.icon strokeWidth={1.5} />
                <span>{item.title}</span>
                {!collapsed && (
                  <ChevronRight
                    strokeWidth={1.5}
                    className={cn(
                      "ml-auto size-3.5 text-sidebar-foreground/40 transition-transform duration-200",
                      isSubOpen && "rotate-90"
                    )}
                  />
                )}
              </SidebarMenuButton>

              <div
                className={cn(
                  "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
                  isSubOpen && !collapsed ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                )}
              >
                <SidebarMenuSub>
                  {item.children.map((child) => (
                    <SidebarMenuSubItem key={child.url}>
                      <SidebarMenuSubButton isActive={pathname === child.url} asChild>
                        <Link href={child.url}>{child.title}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </div>
            </SidebarMenuItem>
          )
        }

        return (
          <SidebarMenuItem key={item.url}>
            <SidebarMenuButton isActive={isActive} tooltip={item.title} asChild>
              <Link href={item.url}>
                <item.icon strokeWidth={1.5} />
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      })}
    </SidebarMenu>
  )
}

const MENU_ITEM_CLASS =
  "flex cursor-pointer items-center gap-2.5 w-full px-3 py-2 text-sm text-left rounded-md transition-colors hover:bg-sidebar-accent"

function UserFooter() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const [menuOpen, setMenuOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  return (
    <div ref={wrapperRef} className="relative">
      <AnimatePresence>
        {menuOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 6 }}
          transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="absolute bottom-full left-0 w-52 mb-2 rounded-xl border border-border bg-popover shadow-lg z-50 overflow-hidden py-1">
          <div className="px-3 py-2 border-b border-border mb-1">
            <p className="text-xs font-medium truncate">Антон</p>
            <p className="text-xs text-muted-foreground truncate">antonm@example.com</p>
          </div>

          <Link
            href={ROUTES.account}
            onClick={() => setMenuOpen(false)}
            className={MENU_ITEM_CLASS}
          >
            <CircleUser strokeWidth={1.5} className="size-4 text-muted-foreground shrink-0" />
            Аккаунт
          </Link>
          <Link
            href={ROUTES.billing}
            onClick={() => setMenuOpen(false)}
            className={MENU_ITEM_CLASS}
          >
            <CreditCard strokeWidth={1.5} className="size-4 text-muted-foreground shrink-0" />
            Биллинг
          </Link>
          <Link
            href={ROUTES.notifications}
            onClick={() => setMenuOpen(false)}
            className={MENU_ITEM_CLASS}
          >
            <Bell strokeWidth={1.5} className="size-4 text-muted-foreground shrink-0" />
            Уведомления
          </Link>

          <div className="my-1 h-px bg-border mx-2" />

          <button
            onClick={() => setMenuOpen(false)}
            className={cn(MENU_ITEM_CLASS, "text-destructive hover:text-destructive")}
          >
            <LogOut strokeWidth={1.5} className="size-4 shrink-0" />
            Выйти
          </button>
        </motion.div>
        )}
      </AnimatePresence>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton
            size="lg"
            tooltip="Аккаунт"
            className="h-auto py-2"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">
              А
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-1 flex-col text-left text-xs min-w-0">
                  <span className="font-medium text-sidebar-foreground truncate">Антон</span>
                  <span className="text-muted-foreground truncate">antonm@example.com</span>
                </div>
                <ChevronsUpDown strokeWidth={1.5} className="ml-auto size-4 text-muted-foreground shrink-0" />
              </>
            )}
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </div>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Logo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavItems />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <UserFooter />
      </SidebarFooter>
    </Sidebar>
  )
}