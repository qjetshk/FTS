"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight } from "lucide-react"
import {
  SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem,
  useSidebar,
} from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib"
import { NAV_ITEMS } from "../nav.data"

export function NavItems() {
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
