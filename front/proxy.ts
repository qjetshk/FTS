import { NextResponse, type NextRequest } from "next/server"

// Без refresh-cookie кабинет не откроется — уводим на /login до рендера, без мелькания страницы.
// Cookie ставит бэк (api.easyfts.ru) с Domain=.easyfts.ru, поэтому она видна и здесь. Валидность не проверяем:
// протухшую сессию отловит клиент (refresh → 401 → /login). Обратный редирект /login → кабинет не делаем —
// с отозванной cookie получился бы цикл.
export function proxy(request: NextRequest) {
  if (request.cookies.has("refresh_token")) return NextResponse.next()
  return NextResponse.redirect(new URL("/login", request.url))
}

export const config = {
  matcher: ["/dashboard/:path*", "/onboarding/:path*", "/welcome/:path*"],
}
