import type { MetadataRoute } from "next"

// индексируем только лендинг: кабинет и вход за авторизацией
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/dashboard", "/onboarding", "/welcome", "/login"] },
    sitemap: "https://easyfts.ru/sitemap.xml",
  }
}
