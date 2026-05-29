import * as React from "react"
import type { Meta, StoryObj } from "@storybook/nextjs-vite"
import { LayoutDashboard, Package, FileText, Building2, ChevronRight, ChevronsUpDown, CircleUser, CreditCard, Bell, LogOut } from "lucide-react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarTrigger,
  SidebarInset,
} from "./Sidebar"
import { cn } from "@/shared/lib"

const meta: Meta = {
  title: "shared/ui/Sidebar",
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
}
export default meta

type Story = StoryObj

const NAV = [
  { icon: LayoutDashboard, label: "Дашборд", active: true },
  { icon: Package, label: "Товары" },
  { icon: FileText, label: "Статформы" },
]

const ORG_CHILDREN = ["Все организации", "Добавить организацию", "Настройки"]

function DemoSidebar({ defaultOpen = true }: { defaultOpen?: boolean }) {
  const [orgOpen, setOrgOpen] = React.useState(false)
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">
              Ф
            </div>
            <span className="font-semibold text-sm truncate">FTS</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {NAV.map(({ icon: Icon, label, active }) => (
                  <SidebarMenuItem key={label}>
                    <SidebarMenuButton isActive={active} tooltip={label}>
                      <Icon strokeWidth={1.5} />
                      <span>{label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}

                {/* Collapsible: Организации */}
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Организации" onClick={() => setOrgOpen((v) => !v)}>
                    <Building2 strokeWidth={1.5} />
                    <span>Организации</span>
                    <ChevronRight
                      strokeWidth={1.5}
                      className={cn(
                        "ml-auto size-3.5 text-sidebar-foreground/40 transition-transform duration-200",
                        orgOpen && "rotate-90"
                      )}
                    />
                  </SidebarMenuButton>
                  <div
                    className={cn(
                      "overflow-hidden transition-[max-height,opacity] duration-200 ease-out",
                      orgOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    )}
                  >
                    <SidebarMenuSub>
                      {ORG_CHILDREN.map((label) => (
                        <SidebarMenuSubItem key={label}>
                          <SidebarMenuSubButton>{label}</SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </div>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarSeparator />

        <SidebarFooter>
          <div className="relative">
            {menuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 rounded-xl border border-border bg-popover shadow-lg z-50 py-1 overflow-hidden">
                <div className="px-3 py-2 border-b border-border mb-1">
                  <p className="text-xs font-medium">Антон</p>
                  <p className="text-xs text-muted-foreground">antonm@example.com</p>
                </div>
                {[
                  { icon: CircleUser, label: "Аккаунт" },
                  { icon: CreditCard, label: "Биллинг" },
                  { icon: Bell, label: "Уведомления" },
                ].map(({ icon: Icon, label }) => (
                  <button key={label} className="flex cursor-pointer items-center gap-2.5 w-full px-3 py-2 text-sm rounded-md hover:bg-sidebar-accent transition-colors">
                    <Icon strokeWidth={1.5} className="size-4 text-muted-foreground" />
                    {label}
                  </button>
                ))}
                <div className="my-1 h-px bg-border mx-2" />
                <button className="flex cursor-pointer items-center gap-2.5 w-full px-3 py-2 text-sm text-destructive rounded-md hover:bg-sidebar-accent transition-colors">
                  <LogOut strokeWidth={1.5} className="size-4" />
                  Выйти
                </button>
              </div>
            )}
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg" tooltip="Аккаунт" className="h-auto py-2" onClick={() => setMenuOpen((v) => !v)}>
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-semibold">А</div>
                  <div className="flex flex-1 flex-col text-left text-xs min-w-0">
                    <span className="font-medium truncate">Антон</span>
                    <span className="text-muted-foreground truncate">antonm@example.com</span>
                  </div>
                  <ChevronsUpDown strokeWidth={1.5} className="ml-auto size-4 text-muted-foreground shrink-0" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center gap-3 border-b border-border px-4">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <span className="text-sm text-muted-foreground">Дашборд</span>
        </header>
        <div className="p-6">
          <p className="text-sm text-muted-foreground">Контент страницы</p>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export const Expanded: Story = {
  render: () => <DemoSidebar defaultOpen={true} />,
}

export const Collapsed: Story = {
  render: () => <DemoSidebar defaultOpen={false} />,
}