"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AnimatePresence, m } from "framer-motion"
import { buttonVariants } from "@/shared/ui"
import { ROUTES } from "@/shared/config"
import { cn } from "@/shared/lib"
import { LogoMark } from "@/shared/ui"

const LINKS = [
  ["#problem", "Зачем"],
  ["#how", "Как работает"],
  ["#faq", "FAQ"],
] as const

// после этой прокрутки шапка hero уже ушла с экрана — показываем закреплённую
const STICKY_AFTER = 120

function NavBar({ authed, sticky }: { authed: boolean; sticky: boolean }) {
  const link = "rounded-lg px-3.5 py-1.5 text-sm font-medium text-foreground no-underline hover:bg-surface-2"
  return (
    <>
      <Link href={ROUTES.home} className="flex flex-1 items-center gap-2 no-underline">
        <LogoMark className={cn("size-7", !sticky && "[&_path]:stroke-green-900 [&_rect]:fill-white")} />
        <span className={cn("font-display text-lg font-medium tracking-tight", sticky ? "text-foreground" : "text-white")}>easyfts</span>
      </Link>

      <nav className="hidden items-center gap-1 rounded-xl bg-white px-2 py-1.5 shadow-lg shadow-black/10 md:flex">
        {LINKS.map(([href, label]) => (
          <a key={href} href={href} className={link}>
            {label}
          </a>
        ))}
        {!authed && (
          <Link href={ROUTES.login} className={link}>
            Войти
          </Link>
        )}
      </nav>

      <div className="flex flex-1 justify-end">
        <Link
          href={authed ? ROUTES.dashboard : ROUTES.login}
          className={cn(
            buttonVariants({ size: "lg" }),
            "rounded-xl bg-white px-5 text-green-950 no-underline shadow-lg shadow-black/10 hover:bg-green-50",
          )}
        >
          {authed ? "Кабинет" : "Начать бесплатно"}
        </Link>
      </div>
    </>
  )
}

// Шапка лежит на зелёной панели hero (логотип, белая «пилюля» навигации, кнопка); при прокрутке сверху
// выезжает закреплённая копия без фона — над контентом плавают только логотип и белые кнопки
export function LandingNav({ authed }: { authed: boolean }) {
  const [sticky, setSticky] = useState(false)

  useEffect(() => {
    const onScroll = () => setSticky(window.scrollY > STICKY_AFTER)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <header className="absolute inset-x-0 top-0 z-20 flex items-center gap-4 px-6 pt-5 sm:px-12 sm:pt-6 lg:pr-14 lg:pl-16 xl:pr-24 xl:pl-28">
        <NavBar authed={authed} sticky={false} />
      </header>

      <AnimatePresence>
        {sticky && (
          <m.header
            initial={{ y: "-100%" }}
            animate={{ y: 0 }}
            exit={{ y: "-100%" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-4 px-6 sm:px-12 lg:pr-14 lg:pl-16 xl:pr-24 xl:pl-28"
          >
            <NavBar authed={authed} sticky />
          </m.header>
        )}
      </AnimatePresence>
    </>
  )
}
