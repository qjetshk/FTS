import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4200/api"

export const getAccessToken = () =>
  typeof window !== "undefined" ? localStorage.getItem("access_token") : null

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getAccessToken()
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

// Mutex: один refresh-запрос на все параллельные 401 (RTK Query + SSE)
let refreshingPromise: Promise<boolean> | null = null

// true — токен обновлён; false — сеть/5xx (сессия жива, можно повторить позже).
// Если refresh-токен невалиден — разлогиниваем и уводим на /login.
export function refreshAccessToken(): Promise<boolean> {
  refreshingPromise ??= (async () => {
    try {
      const res = await fetch(`${API_URL}/auth/refresh`, { method: "POST", credentials: "include" })
      if (res.ok) {
        const data = (await res.json()) as { accessToken: string; user?: unknown }
        localStorage.setItem("access_token", data.accessToken)
        if (data.user) localStorage.setItem("user:v1", JSON.stringify(data.user))
        return true
      }
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user:v1")
        window.location.href = "/login"
      }
      return false
    } catch {
      return false
    } finally {
      refreshingPromise = null
    }
  })()
  return refreshingPromise
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401 && (await refreshAccessToken())) {
    result = await rawBaseQuery(args, api, extraOptions)
  }

  return result
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Statform", "Organization", "User", "Sessions", "Stats"],
  endpoints: () => ({}),
})
