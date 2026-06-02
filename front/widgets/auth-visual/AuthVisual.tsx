"use client"

import { m } from "framer-motion"

export function AuthVisual() {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[oklch(0.96_0.018_150)]">
      {/* Blob 1 — large, top-right */}
      <m.div
        className="absolute -top-1/2 right-0 size-full rounded-full bg-[oklch(0.80_0.11_145)] blur-[90px]"
        animate={{
          x: [0, 60, -40, 20, 0],
          y: [0, -60, 40, -20, 0],
          scale: [1, 1.15, 0.9, 1.08, 1],
        }}
        transition={{ duration: 9, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      />

      {/* Blob 2 — medium, bottom-left */}
      <m.div
        className="absolute -bottom-1/2 -left-1/4 size-4/5 rounded-full bg-[oklch(0.84_0.09_155)] blur-[70px]"
        animate={{
          x: [0, -50, 60, -20, 0],
          y: [0, 60, -40, 30, 0],
          scale: [1, 0.88, 1.12, 0.95, 1],
        }}
        transition={{ duration: 11, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      />

      {/* Blob 3 — small, center-right */}
      <m.div
        className="absolute top-1/4 right-1/4 size-1/2 rounded-full bg-[oklch(0.89_0.07_148)] opacity-80 blur-[60px]"
        animate={{
          x: [0, 70, -30, 50, 0],
          y: [0, -40, 70, -20, 0],
          scale: [1, 1.2, 0.85, 1.1, 1],
        }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "loop", ease: "easeInOut" }}
      />
    </div>
  )
}
