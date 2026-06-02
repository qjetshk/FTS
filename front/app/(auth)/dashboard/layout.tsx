import { cookies } from "next/headers"
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/shared/ui"
import { AppSidebar } from "@/widgets/app-sidebar"
import { DashboardBreadcrumb } from "@/widgets/dashboard-breadcrumb"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const sidebarOpen = cookieStore.get("sidebar_state")?.value !== "false"

  return (
    <SidebarProvider defaultOpen={sidebarOpen}>
      <AppSidebar />
      <SidebarInset>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
          <SidebarTrigger />
          <div className="h-4 w-px bg-border" />
          <DashboardBreadcrumb />
        </header>
        <div className="flex flex-1 flex-col p-6">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}