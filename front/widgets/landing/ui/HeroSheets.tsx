"use client"

import { useEffect, useRef, useState } from "react"
import { m, useInView, useReducedMotion } from "framer-motion"
import { GlassSheet } from "./sheets/GlassSheet"
import { PaperSheet } from "./sheets/PaperSheet"
import { XmlSheet } from "./sheets/XmlSheet"

const SPRING = { type: "spring", stiffness: 170, damping: 22, mass: 0.9 } as const

// Положение листов: стопкой веером в покое, при наведении разъезжаются и выпрямляются
const POSE = {
  glass: { closed: { x: -44, y: -18, rotate: -10 }, open: { x: -176, y: 10, rotate: -8 } },
  xml: { closed: { x: -6, y: -4, rotate: -3 }, open: { x: 176, y: 10, rotate: 7 } },
  paper: { closed: { x: 34, y: 16, rotate: 5 }, open: { x: 0, y: -14, rotate: 0, scale: 1.03 } },
}

// На узком экране полный разлёт уводит крайние листы за край — раскрываем вполовину
const POSE_TOUCH = {
  glass: { ...POSE.glass, open: { x: -84, y: 0, rotate: -9 } },
  xml: { ...POSE.xml, open: { x: 84, y: 0, rotate: 7 } },
  paper: POSE.paper,
}

// Три статформы в hero: бумажная (что видит продавец), XML (что уходит в ФТС), стеклянный силуэт для глубины.
// На тач-экранах наведения нет — веер раскрывается сам, когда блок попадает в экран
export function HeroSheets() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { amount: 0.6, once: true })
  const reduce = useReducedMotion()
  const [hover, setHover] = useState(false)
  const [touch, setTouch] = useState(false)

  useEffect(() => {
    setTouch(window.matchMedia("(hover: none)").matches)
  }, [])

  const open = hover || (touch && inView)
  const state = open ? "open" : "closed"
  const pose = touch ? POSE_TOUCH : POSE
  const transition = reduce ? { duration: 0 } : SPRING

  return (
    <div
      ref={ref}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className="relative h-[460px] w-full max-w-[640px] scale-[0.78] sm:scale-100"
      aria-hidden
    >
      <m.div
        className="absolute top-1/2 left-1/2 -mt-[200px] -ml-[150px]"
        variants={pose.glass}
        initial="closed"
        animate={state}
        transition={transition}
      >
        <GlassSheet />
      </m.div>
      <m.div
        className="absolute top-1/2 left-1/2 -mt-[200px] -ml-[150px]"
        variants={pose.xml}
        initial="closed"
        animate={state}
        transition={{ ...transition, delay: reduce ? 0 : 0.03 }}
      >
        <XmlSheet />
      </m.div>
      <m.div
        className="absolute top-1/2 left-1/2 -mt-[200px] -ml-[150px]"
        variants={pose.paper}
        initial="closed"
        animate={state}
        transition={{ ...transition, delay: reduce ? 0 : 0.06 }}
      >
        <PaperSheet />
      </m.div>
    </div>
  )
}
