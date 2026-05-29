import {
  LayoutDashboard,
  Package,
  FileText,
  Building2,
  type LucideIcon,
} from "lucide-react"
import { ROUTES } from "@/shared/config"

export type NavChild = {
  title: string
  url: string
}

export type NavItem = {
  title: string
  url: string
  icon: LucideIcon
  badge?: string | number
  children?: NavChild[]
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Дашборд", url: ROUTES.dashboard, icon: LayoutDashboard },
  { title: "Товары", url: ROUTES.products, icon: Package },
  { title: "Статформы", url: ROUTES.statforms, icon: FileText },
  {
    title: "Организации",
    url: ROUTES.organizations,
    icon: Building2,
    children: [
      { title: "Все организации", url: ROUTES.organizations },
      { title: "Добавить организацию", url: `${ROUTES.organizations}/new` },
      { title: "Настройки", url: `${ROUTES.organizations}/settings` },
    ],
  },
]