"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { LogoMark } from "@/components/LogoMark";
import { ThemeToggle } from "@/components/ThemeToggle";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 backdrop-blur-[12px]"
      style={{
        height: "var(--nav-height)",
        background: "var(--nav-bg)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
        transition: "border-color 200ms",
      }}
    >
      <div className="container-page flex items-center gap-2 h-full">
        <Link href="#" className="flex items-center gap-[9px] no-underline shrink-0">
          <LogoMark />
          <span className="text-[20px] font-bold tracking-[-0.02em]" style={{ color: "var(--text-primary)" }}>easyfts</span>
        </Link>

        <nav className="nav-links flex gap-7 ml-7 flex-1">
          {([["#how", "Как работает"], ["#pricing", "Тарифы"], ["#faq", "FAQ"]] as const).map(([href, label]) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium no-underline transition-colors duration-150"
              style={{ color: "var(--text-secondary)" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-secondary)"; }}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-[14px]">
          {/* <ThemeToggle /> */}
          <a
            href="#cta"
            className={cn(
              buttonVariants({ variant: "brand-outline" }),
              "h-9 px-[18px] text-sm font-semibold no-underline"
            )}
          >
            Оставить заявку
          </a>
        </div>
      </div>
    </header>
  );
}
