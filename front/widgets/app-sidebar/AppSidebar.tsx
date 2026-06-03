"use client"

import { useSidebar, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarSeparator } from "@/shared/ui"
import { NavItems } from "./ui/NavItems"
import { UserFooter } from "./ui/UserFooter"

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
