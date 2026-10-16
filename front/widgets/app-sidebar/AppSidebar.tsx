"use client"

import { LogoMark, useSidebar, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarSeparator } from "@/shared/ui"
import { NavItems } from "./ui/NavItems"
import { UserFooter } from "./ui/UserFooter"

function Logo() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  return (
    <div className="flex items-center gap-2 px-2 py-1">
      <LogoMark className="size-7 shrink-0" />
      {!collapsed && (
        <span className="font-display text-base font-medium tracking-tight text-sidebar-foreground truncate">easyfts</span>
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
