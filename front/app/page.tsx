import type { Metadata } from "next"
import { cookies } from "next/headers"
import {
  FAQ_ITEMS,
  FaqSection,
  FinalCta,
  HowItWorksSection,
  LandingFooter,
  LandingHero,
  PainSection,
  StatsSection,
} from "@/widgets/landing"

const SITE_URL = "https://easyfts.ru"
const TITLE = "easyfts — статформы ФТС автоматически"
const DESCRIPTION =
  "easyfts каждый месяц собирает статформы ФТС для Ozon-селлеров, работающих с ЕАЭС: XML по каждой стране, коды ТН ВЭД, уведомления в Telegram."

// og:image — из app/opengraph-image.tsx
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
  openGraph: { type: "website", url: SITE_URL, title: TITLE, description: DESCRIPTION, siteName: "easyfts", locale: "ru_RU" },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
}

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map(({ q, a }) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
}

export default async function LandingPage() {
  // refresh-cookie бэка (Domain=.easyfts.ru) — значит, уже входил: кнопки ведут сразу в кабинет
  const authed = (await cookies()).has("refresh_token")

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <main>
        <LandingHero authed={authed} />
        <PainSection />
        <HowItWorksSection />
        <StatsSection />
        <FaqSection />
        <FinalCta authed={authed} />
      </main>
      <LandingFooter />
    </>
  )
}
