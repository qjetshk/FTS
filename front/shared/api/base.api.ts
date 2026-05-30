import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from "@reduxjs/toolkit/query"

const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4200/api"

const rawBaseQuery = fetchBaseQuery({
  baseUrl,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = typeof window !== "undefined"
      ? localStorage.getItem("access_token")
      : null
    if (token) headers.set("Authorization", `Bearer ${token}`)
    return headers
  },
})

// Mutex: гарантирует один refresh-запрос при параллельных 401
let refreshingPromise: Promise<any> | null = null

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions,
) => {
  let result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    if (!refreshingPromise) {
      refreshingPromise = rawBaseQuery(
        { url: "/auth/refresh", method: "POST" },
        api,
        extraOptions,
      )
    }

    try {
      const refreshResult = await refreshingPromise
      if (refreshResult.data) {
        const data = refreshResult.data as { accessToken: string; user: unknown }
        localStorage.setItem("access_token", data.accessToken)
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user))
        result = await rawBaseQuery(args, api, extraOptions)
      } else {
        localStorage.removeItem("access_token")
        localStorage.removeItem("user")
        if (typeof window !== "undefined") {
          window.location.href = "/login"
        }
      }
    } finally {
      refreshingPromise = null
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Product", "Statform", "Organization", "User"],
  endpoints: () => ({}),
})
