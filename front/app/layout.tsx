import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { Providers } from "@/app/providers"
import "./globals.css"

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-sans",
  display: "swap",
})

export const metadata: Metadata = {
  title: "easyfts — Таможенная отчётность",
  description: "Автоматизация статформ и классификации товаров для продавцов OZON",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-background text-foreground">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}