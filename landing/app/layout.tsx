import type { Metadata } from "next";
import "./globals.css";

const SITE_URL = "https://easyfts.ru";
const TITLE = "easyfts — статформы ФТС автоматически";
const DESCRIPTION =
  "easyfts автоматически генерирует статформы ФТС каждый месяц для Ozon-селлеров, работающих с ЕАЭС. Скачайте готовый XML и загрузите в личный кабинет.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: TITLE,
    description: DESCRIPTION,
    siteName: "easyfts",
    locale: "ru_RU",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "easyfts — статформы ФТС для Ozon-селлеров",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* Theme bootstrap — prevents FOUC */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var s=localStorage.getItem('easyfts:theme');var p=window.matchMedia&&window.matchMedia('(prefers-color-scheme:dark)').matches;var t=s||(p?'dark':'light');document.documentElement.setAttribute('data-theme',t);document.documentElement.style.colorScheme=t;}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`,
          }}
        />
      </head>
      <body style={{ minHeight: "100vh" }}>{children}</body>
    </html>
  );
}
