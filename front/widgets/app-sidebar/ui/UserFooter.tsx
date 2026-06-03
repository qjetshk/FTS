
"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AnimatePresence, m } from "framer-motion"
import { ChevronsUpDown, CircleUser, CreditCard, Bell, LogOut } from "lucide-react"
import {
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar, Button,
} from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib"
import { useUser, useLogoutMutation } from "@/entities/user"

const MENU_ITEM_CLASS =
  "flex cursor-pointer items-center gap-2.5 w-full px-3 py-2 text-sm text-left rounded-md transition-colors hover:bg-sidebar-accent"

function UserAvatar({ avatarUrl, name, size = 8 }: { avatarUrl: string | null; name: string; size?: number }) {
  const initials = name.trim().charAt(0).toUpperCase()
  const sizeClass = `size-${size}`
  if (avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatarUrl} alt={name} className={cn(sizeClass, "shrink-0 rounded-full object-cover")} />
    )
  }
  return (
    <div className={cn(sizeClass, "shrink-0 flex items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold")}>
      {initials}
    </div>
  )
}

export function UserFooter() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const [menuOpen, setMenuOpen] = React.useState(false)
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const { user } = useUser()
  const [logout] = useLogoutMutation()
  const router = useRouter()

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

  const handleLogout = async () => {
    setMenuOpen(false)
    try {
      await logout().unwrap()
    } catch {}
    localStorage.removeItem("access_token")
    localStorage.removeItem("user:v1")
    router.replace(ROUTES.login)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <AnimatePresence>
        {menuOpen && (
          <m.div
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 6 }}
            transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-full left-0 w-52 mb-2 rounded-xl border border-border bg-popover shadow-lg z-50 overflow-hidden py-1"
          >
            <div className="px-3 py-2 border-b border-border mb-1">
              <p className="text-xs font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Link href={ROUTES.account} onClick={() => setMenuOpen(false)} className={MENU_ITEM_CLASS}>
              <CircleUser strokeWidth={1.5} className="size-4 text-muted-foreground shrink-0" />Аккаунт
            </Link>
            <Link href={ROUTES.billing} onClick={() => setMenuOpen(false)} className={MENU_ITEM_CLASS}>
              <CreditCard strokeWidth={1.5} className="size-4 text-muted-foreground shrink-0" />Биллинг
            </Link>
            <Link href={ROUTES.notifications} onClick={() => setMenuOpen(false)} className={MENU_ITEM_CLASS}>
              <Bell strokeWidth={1.5} className="size-4 text-muted-foreground shrink-0" />Уведомления
            </Link>
            <div className="my-1 h-px bg-border mx-2" />
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="w-full justify-start gap-2.5 px-3 py-2 h-auto text-destructive hover:text-destructive hover:bg-sidebar-accent"
            >
              <LogOut strokeWidth={1.5} className="size-4 shrink-0" />Выйти
            </Button>
          </m.div>
        )}
      </AnimatePresence>

      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" tooltip="Аккаунт" className="h-auto py-2" onClick={() => setMenuOpen((v) => !v)}>
            <UserAvatar avatarUrl={user?.avatarUrl ?? null} name={user?.name ?? ""} />
            {!collapsed && (
              <>
                <div className="flex flex-1 flex-col text-left text-xs min-w-0">
                  <span className="font-medium text-sidebar-foreground truncate">{user?.name}</span>
                  <span className="text-muted-foreground truncate">{user?.email}</span>
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
