import { LogoMark } from "./LogoMark"

export function LandingFooter() {
  return (
    <footer className="border-t border-border bg-background py-8">
      <div className="mx-auto flex max-w-(--container-max) flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <LogoMark className="size-[22px]" />
          <span className="text-sm font-semibold text-text-secondary">easyfts, 2026</span>
        </div>
        <a href="mailto:help@easyfts.ru" className="text-[13px] font-medium text-text-muted no-underline hover:text-foreground">
          help@easyfts.ru
        </a>
      </div>
    </footer>
  )
}
