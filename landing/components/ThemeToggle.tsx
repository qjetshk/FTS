"use client";

import { useState } from "react";

export function ThemeToggle() {
  const [theme, setTheme] = useState<string>(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "light";
    }
    return "light";
  });

  const isDark = theme === "dark";

  const toggle = () => {
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme-switching", "");
    document.documentElement.setAttribute("data-theme", next);
    document.documentElement.style.colorScheme = next;
    try { localStorage.setItem("easyfts:theme", next); } catch { /* ignore */ }
    setTheme(next);
    setTimeout(() => document.documentElement.removeAttribute("data-theme-switching"), 360);
  };

  return (
    <button
      onClick={toggle}
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Включить светлую тему" : "Включить тёмную тему"}
      style={{
        position: "relative",
        width: 56, height: 28,
        flexShrink: 0,
        background: "var(--surface-2)",
        border: "1px solid var(--border)",
        borderRadius: 999,
        padding: 0,
        cursor: "pointer",
        transition: "background 240ms var(--ease-out), border-color 240ms var(--ease-out)",
        outline: "none",
      }}
    >
      {/* Sun */}
      <span style={{
        position: "absolute", left: 7, top: "50%", transform: "translateY(-50%)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: isDark ? "var(--text-muted)" : "#F59E0B",
        opacity: isDark ? 0.5 : 1,
        transition: "opacity 240ms, color 240ms",
        pointerEvents: "none",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2" /><path d="M12 20v2" />
          <path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" />
          <path d="M2 12h2" /><path d="M20 12h2" />
          <path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" />
        </svg>
      </span>
      {/* Moon */}
      <span style={{
        position: "absolute", right: 7, top: "50%", transform: "translateY(-50%)",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        color: isDark ? "#E0E7FF" : "var(--text-muted)",
        opacity: isDark ? 1 : 0.5,
        transition: "opacity 240ms, color 240ms",
        pointerEvents: "none",
      }}>
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
      </span>
      {/* Thumb */}
      <span aria-hidden="true" style={{
        position: "absolute",
        top: 2, left: 2,
        width: 22, height: 22,
        borderRadius: "50%",
        background: "var(--background)",
        boxShadow: "0 1px 2px rgba(0,0,0,.18), 0 1px 4px rgba(0,0,0,.08)",
        transform: isDark ? "translateX(28px)" : "translateX(0)",
        transition: "transform 280ms cubic-bezier(0.34,1.56,0.64,1), background 240ms",
      }} />
    </button>
  );
}
