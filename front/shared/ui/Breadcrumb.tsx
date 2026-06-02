import * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/shared/lib"

function Breadcrumb({ className, ...props }: React.ComponentProps<"nav">) {
  return <nav aria-label="breadcrumb" className={cn("flex", className)} {...props} />
}

function BreadcrumbList({ className, ...props }: React.ComponentProps<"ol">) {
  return (
    <ol
      className={cn("flex flex-wrap items-center gap-1 text-sm text-muted-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbItem({ className, ...props }: React.ComponentProps<"li">) {
  return <li className={cn("inline-flex items-center gap-1", className)} {...props} />
}

function BreadcrumbLink({
  asChild = false,
  className,
  children,
  ...props
}: React.ComponentProps<"a"> & { asChild?: boolean }) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
      className: cn(
        "transition-colors hover:text-foreground",
        (children.props as { className?: string }).className,
        className
      ),
    })
  }
  return (
    <a
      className={cn("transition-colors hover:text-foreground", className)}
      {...props}
    >
      {children}
    </a>
  )
}

function BreadcrumbPage({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-disabled="true"
      aria-current="page"
      className={cn("font-normal text-foreground", className)}
      {...props}
    />
  )
}

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"li">) {
  return (
    <li role="presentation" aria-hidden="true" className={cn("text-muted-foreground/50", className)} {...props}>
      {children ?? <ChevronRight strokeWidth={1.5} className="size-3.5" />}
    </li>
  )
}

function BreadcrumbEllipsis({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontal strokeWidth={1.5} className="size-4" />
      <span className="sr-only">Ещё</span>
    </span>
  )
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}