"use client"

import * as React from "react"
import { PanelLeft } from "lucide-react"
import { cn } from "@/shared/lib"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_KEYBOARD_SHORTCUT = "b"
const SIDEBAR_WIDTH = "240px"
const SIDEBAR_COLLAPSED_WIDTH = "56px"
const MOBILE_BREAKPOINT = 768

// ── Context ───────────────────────────────────────────────
type SidebarState = "expanded" | "collapsed"

type SidebarContextValue = {
  state: SidebarState
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextValue | null>(null)

function useSidebar() {
  const ctx = React.useContext(SidebarContext)
  if (!ctx) throw new Error("useSidebar must be used within SidebarProvider")
  return ctx
}

// ── Provider ──────────────────────────────────────────────
type SidebarProviderProps = React.ComponentProps<"div"> & {
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  ...props
}: SidebarProviderProps) {
  const [isMobile, setIsMobile] = React.useState(() =>
    typeof window !== "undefined"
      ? window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`).matches
      : false
  )
  const [openMobile, setOpenMobile] = React.useState(false)
  const [_open, _setOpen] = React.useState(defaultOpen)

  const open = openProp ?? _open

  const setOpen = React.useCallback(
    (value: boolean) => {
      if (setOpenProp) {
        setOpenProp(value)
      } else {
        _setOpen(value)
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp]
  )

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v)
    } else {
      setOpen(!open)
    }
  }, [isMobile, open, setOpen])

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [toggleSidebar])

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => setIsMobile(mql.matches)
    mql.addEventListener("change", onChange)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  const state: SidebarState = isMobile ? "expanded" : open ? "expanded" : "collapsed"

  const contextValue = React.useMemo(
    () => ({ state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar }),
    [state, open, setOpen, openMobile, setOpenMobile, isMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div
        data-sidebar-state={state}
        className={cn("group/sidebar-wrapper flex min-h-svh w-full", className)}
        style={{ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-collapsed-width": SIDEBAR_COLLAPSED_WIDTH, ...style } as React.CSSProperties}
        {...props}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

// ── Sidebar ───────────────────────────────────────────────
type SidebarProps = React.ComponentProps<"aside"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "icon" | "offcanvas" | "none"
}

function Sidebar({ side = "left", variant = "sidebar", collapsible = "icon", className, children, ...props }: SidebarProps) {
  const { state, isMobile, openMobile, setOpenMobile } = useSidebar()

  if (isMobile) {
    return (
      <>
        {openMobile && (
          <div
            className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm transition-opacity duration-200"
            onClick={() => setOpenMobile(false)}
          />
        )}
        <aside
          data-sidebar="sidebar"
          data-state={openMobile ? "expanded" : "collapsed"}
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex h-svh flex-col bg-sidebar shadow-xl",
            "w-(--sidebar-width) transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            openMobile ? "translate-x-0" : "-translate-x-full",
            className
          )}
          {...props}
        >
          {children}
        </aside>
      </>
    )
  }

  if (collapsible === "none") {
    return (
      <aside data-sidebar="sidebar" className={cn("flex h-svh flex-col bg-sidebar w-(--sidebar-width)", className)} {...props}>
        {children}
      </aside>
    )
  }

  return (
    <aside
      data-sidebar="sidebar"
      data-state={state}
      data-collapsible={collapsible}
      data-variant={variant}
      data-side={side}
      className={cn(
        "group/sidebar relative flex h-svh flex-col bg-sidebar border-r border-sidebar-border",
        "transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-[width]",
        state === "expanded" ? "w-(--sidebar-width)" : collapsible === "icon" ? "w-(--sidebar-collapsed-width)" : "w-0 border-r-0",
        variant === "floating" && "m-2 h-[calc(100svh-1rem)] rounded-xl border shadow-sm",
        variant === "inset" && "m-2 h-[calc(100svh-1rem)] rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </aside>
  )
}

// ── SidebarTrigger ────────────────────────────────────────
function SidebarTrigger({ className, onClick, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      data-sidebar="trigger"
      aria-label="Toggle sidebar"
      onClick={(e) => { onClick?.(e); toggleSidebar() }}
      className={cn(
        "inline-flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md",
        "text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
        "outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    >
      <PanelLeft className="size-4" strokeWidth={1.5} />
    </button>
  )
}

// ── SidebarRail ───────────────────────────────────────────
function SidebarRail({ className, ...props }: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar()
  return (
    <button
      type="button"
      data-sidebar="rail"
      aria-label="Toggle sidebar"
      tabIndex={-1}
      onClick={toggleSidebar}
      className={cn(
        "absolute inset-y-0 right-0 z-20 hidden w-4 -translate-x-1/2 cursor-col-resize",
        "transition-all ease-linear group-data-[side=left]:-right-4",
        "sm:flex items-center justify-center",
        "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 hover:after:bg-sidebar-border",
        className
      )}
      {...props}
    />
  )
}

// ── SidebarInset ──────────────────────────────────────────
function SidebarInset({ className, ...props }: React.ComponentProps<"main">) {
  return <main data-sidebar="inset" className={cn("relative flex flex-1 flex-col overflow-hidden", className)} {...props} />
}

// ── Sections ──────────────────────────────────────────────
function SidebarHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function SidebarFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props} />
}

function SidebarContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="content"
      className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden", className)}
      {...props}
    />
  )
}

function SidebarSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-sidebar="separator" className={cn("mx-2 my-1 h-px bg-sidebar-border", className)} {...props} />
}

// ── Groups ────────────────────────────────────────────────
function SidebarGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props} />
}

function SidebarGroupLabel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="group-label"
      className={cn(
        "flex h-8 shrink-0 items-center rounded-md px-2 whitespace-nowrap",
        "text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/40",
        "overflow-hidden transition-[height,opacity,margin] duration-200 ease-out",
        "group-data-[state=collapsed]/sidebar:h-0 group-data-[state=collapsed]/sidebar:opacity-0 group-data-[state=collapsed]/sidebar:-mt-1",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupAction({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-sidebar="group-action"
      className={cn(
        "absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0",
        "text-sidebar-foreground outline-none ring-sidebar-ring transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarGroupContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props} />
}

// ── Menu ──────────────────────────────────────────────────
function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return <ul data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-0.5", className)} {...props} />
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li data-sidebar="menu-item" className={cn("group/menu-item relative list-none", className)} {...props} />
}

type SidebarMenuButtonProps = {
  isActive?: boolean
  tooltip?: string
  size?: "default" | "sm" | "lg"
  className?: string
  children?: React.ReactNode
  asChild?: boolean
} & Omit<React.ComponentProps<"button">, "children">

function SidebarMenuButton({ isActive = false, size = "default", tooltip, className, children, asChild = false, type = "button", ...props }: SidebarMenuButtonProps) {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"

  const buttonClass = cn(
    "peer/menu-button flex w-full items-center overflow-hidden rounded-md px-2 py-1.5",
    collapsed ? "gap-0" : "gap-2.5",
    "text-left text-sm text-sidebar-foreground outline-none ring-sidebar-ring",
    "cursor-pointer",
    // transition: width+padding for sidebar collapse, opacity for hover highlight
    "transition-[background,color] duration-150",
    // hover — lighter bg, keep text color
    "hover:bg-sidebar-accent",
    "focus-visible:ring-2",
    "disabled:pointer-events-none disabled:opacity-50",
    // active — green icon; collapsed: compact green-tinted chip, expanded: sidebar-accent bg
    isActive && !collapsed && "bg-sidebar-accent text-primary [&>svg]:text-primary",
    isActive && collapsed && "bg-primary/10 [&>svg]:text-primary",
    !isActive && "text-sidebar-foreground/80 [&>svg]:text-sidebar-foreground/50",
    "[&>svg]:shrink-0 [&>svg]:transition-colors [&>svg]:duration-150",
    size === "sm" && "text-xs [&>svg]:size-3.5",
    size === "default" && "[&>svg]:size-4",
    size === "lg" && "p-2 [&>svg]:size-4",
    // collapsed: centre icon, fade+hide text spans
    collapsed && "justify-center px-0",
    // text span fade
    "[&>span:not(.no-fade)]:transition-[opacity,max-width] [&>span:not(.no-fade)]:duration-150 [&>span:not(.no-fade)]:overflow-hidden [&>span:not(.no-fade)]:whitespace-nowrap",
    collapsed && "[&>span:not(.no-fade)]:max-w-0 [&>span:not(.no-fade)]:opacity-0",
    className
  )

  const dataAttrs = {
    "data-sidebar": "menu-button" as const,
    "data-active": isActive,
    "data-size": size,
    title: collapsed ? tooltip : undefined,
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      ...dataAttrs,
      className: cn(buttonClass, (children.props as { className?: string }).className),
    })
  }

  return (
    <button {...dataAttrs} type={type} className={buttonClass} {...props}>
      {children}
    </button>
  )
}

function SidebarMenuAction({ className, showOnHover = false, ...props }: React.ComponentProps<"button"> & { showOnHover?: boolean }) {
  return (
    <button
      type="button"
      data-sidebar="menu-action"
      className={cn(
        "absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0",
        "text-sidebar-foreground outline-none ring-sidebar-ring transition-colors",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
        showOnHover && "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 md:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuBadge({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-sidebar="menu-badge"
      className={cn(
        "pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1",
        "text-xs font-medium tabular-nums text-sidebar-foreground",
        "group-data-[state=collapsed]/sidebar:hidden",
        className
      )}
      {...props}
    />
  )
}

// ── Sub-menu ──────────────────────────────────────────────
function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-sidebar="menu-sub"
      className={cn(
        "ml-2 flex min-w-0 flex-col gap-0.5 border-l border-sidebar-border/60 pl-3 py-0.5 mt-0.5",
        "group-data-[state=collapsed]/sidebar:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("list-none", className)} {...props} />
}

function SidebarMenuSubButton({
  isActive = false,
  asChild = false,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & { isActive?: boolean; asChild?: boolean }) {
  const buttonClass = cn(
    "flex h-7 w-full min-w-0 items-center gap-2 overflow-hidden rounded-md px-2",
    "text-xs text-sidebar-foreground/70 outline-none ring-sidebar-ring",
    "cursor-pointer transition-colors duration-150",
    "hover:bg-sidebar-accent hover:text-sidebar-foreground",
    "focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
    isActive && "text-primary font-medium",
    "[&>svg]:size-3.5 [&>svg]:shrink-0",
    className
  )

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      "data-sidebar": "menu-sub-button",
      "data-active": isActive,
      className: cn(buttonClass, (children.props as { className?: string }).className),
    })
  }

  return (
    <button type="button" data-sidebar="menu-sub-button" data-active={isActive} className={buttonClass} {...props}>
      {children}
    </button>
  )
}

export {
  useSidebar,
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarRail,
  SidebarInset,
  SidebarHeader,
  SidebarFooter,
  SidebarContent,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
}