import type { Metadata } from "next"
import localFont from "next/font/local"
import { Providers } from "@/app/providers"
import "./globals.css"

// шрифты лежат в репо (app/fonts, OFL), а не тянутся с Google при сборке: сборка не зависит от сети
const onest = localFont({
  src: "./fonts/Onest-Variable.woff2",
  weight: "100 900",
  variable: "--font-sans",
  display: "swap",
})

// акцентный — только для крупных заголовков
const martian = localFont({
  src: "./fonts/MartianGrotesk-Variable.woff2",
  weight: "100 1000",
  variable: "--font-display",
  display: "swap",
})

// коды ТН ВЭД, ключи, номера — из того же семейства, что и заголовки
const martianMono = localFont({
  src: "./fonts/MartianMono-Variable.woff2",
  weight: "100 800",
  variable: "--font-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "easyfts — Таможенная отчётность",
  description: "Автоматизация статформ и классификации товаров для продавцов OZON",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="ru" className={`${onest.variable} ${martian.variable} ${martianMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}