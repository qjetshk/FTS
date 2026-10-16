"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"
import { m, useAnimation, useReducedMotion } from "framer-motion"

const FLOAT = { duration: 4, repeat: Infinity, ease: "easeInOut" } as const
const LIFT = { type: "spring", stiffness: 220, damping: 18 } as const
// возврат после наведения — мягко на место, без рывка в начало цикла
const SETTLE = { duration: 0.9, ease: [0.33, 1, 0.68, 1] } as const

const CARD = { rest: { y: 0 }, lift: { y: -24 }, float: { y: [0, -10, 0] } }
const SHADOW = {
  rest: { scaleX: 1, opacity: 0.85 },
  lift: { scaleX: 0.75, opacity: 0.5 },
  float: { scaleX: [1, 0.9, 1], opacity: [0.85, 0.65, 0.85] },
}

// Иллюстрация hero: медленно «парит», тень внизу дышит в такт; на наведении парение замирает и лист поднимается выше
export function HeroIllustration() {
  const reduce = useReducedMotion()
  const card = useAnimation()
  const shadow = useAnimation()
  const hovered = useRef(false)

  const float = () => {
    card.start(CARD.float, FLOAT)
    shadow.start(SHADOW.float, FLOAT)
  }

  useEffect(() => {
    if (!reduce) float()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduce])

  const onEnter = () => {
    if (reduce) return
    hovered.current = true
    card.start(CARD.lift, LIFT)
    shadow.start(SHADOW.lift, LIFT)
  }

  const onLeave = async () => {
    if (reduce) return
    hovered.current = false
    await Promise.all([card.start(CARD.rest, SETTLE), shadow.start(SHADOW.rest, SETTLE)])
    // за время возврата курсор мог вернуться — тогда парение не запускаем
    if (!hovered.current) float()
  }

  return (
    <div
      className="relative flex w-full max-w-[640px] shrink-0 flex-col items-center lg:min-w-[480px]"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      <m.div className="relative z-10 w-full" initial={CARD.rest} animate={card}>
        <Image
          src="/landing/hero-statform.webp"
          alt=""
          width={858}
          height={760}
          priority
          className="w-full select-none"
          draggable={false}
        />
      </m.div>
      <m.div
        aria-hidden
        className="-mt-16 h-10 w-3/5 rounded-[50%] bg-black blur-2xl"
        initial={SHADOW.rest}
        animate={shadow}
      />
    </div>
  )
}
