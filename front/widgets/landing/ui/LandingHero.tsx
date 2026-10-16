"use client"

import { m } from "framer-motion"
import { StartLink } from "./StartLink"
import Image from "next/image"
// временно: иллюстрация вместо веера листов — вернуть, если не зайдёт
// import { HeroSheets } from "./HeroSheets"
import { LandingNav } from "./LandingNav"

const EASE = [0.16, 1, 0.3, 1] as const

// Тёмно-зелёная панель на высоту экрана с шапкой внутри: текст слева, справа — листы статформ
// (три листа статформ веером — при наведении разъезжаются)
export function LandingHero({ authed }: { authed: boolean }) {
  return (
    <section className="p-2 sm:p-3">
      <div className="relative grid min-h-[640px] items-center gap-12 overflow-hidden rounded-3xl bg-green-950 bg-[radial-gradient(ellipse_60%_70%_at_75%_50%,rgb(21_128_61/0.45),transparent),radial-gradient(ellipse_50%_60%_at_0%_100%,rgb(22_101_52/0.45),transparent)] px-6 pt-28 pb-14 sm:px-12 lg:h-[calc(100svh-1.5rem)] lg:max-h-[920px] lg:pt-24 lg:pb-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] xl:grid-cols-[1fr_minmax(0,640px)] lg:py-0 lg:px-16 xl:gap-16 xl:px-24">
        <LandingNav authed={authed} />

        <m.div
          // z-10: на 1024–1280 px картинка шире своей колонки и уходит под заголовок
          className="relative z-10 flex min-w-0 flex-col items-start"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
        >
          <h1 className="max-w-[17ch] font-display lg:max-w-none text-[34px] leading-[1.05] font-medium tracking-tight text-balance text-white sm:text-[48px] lg:text-[58px]">
            <span className="lg:whitespace-nowrap">Сотни отправок&nbsp;—</span> одна статформа
          </h1>
          <p className="mt-6 max-w-[46ch] text-base leading-relaxed text-green-100/75 sm:text-lg">
            Статформы ЕАЭС для продавцов Ozon. Подключаете магазин один раз — каждое 1-е число XML по Казахстану,
            Беларуси, Армении и Киргизии приходят в Telegram или на почту.
          </p>
          <div className="mt-8 flex flex-col items-start gap-2.5">
            <StartLink authed={authed} className="bg-white text-green-950 hover:bg-green-50" />
            {!authed && <span className="text-[13px] text-green-100/55">Вход по почте или через Telegram, карта не нужна</span>}
          </div>
        </m.div>

        <m.div
          className="flex justify-center lg:justify-end"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
        >
          {/* <HeroSheets /> */}
          <Image
            src="/landing/hero-statform.webp"
            alt=""
            width={858}
            height={760}
            priority
            className="w-full max-w-[640px] shrink-0 select-none lg:min-w-[480px]"
          />
        </m.div>
      </div>
    </section>
  )
}
