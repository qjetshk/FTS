import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4200",
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = typeof window !== "undefined"
        ? localStorage.getItem("access_token")
        : null
      if (token) headers.set("Authorization", `Bearer ${token}`)
      return headers
    },
  }),
  tagTypes: ["Product", "Statform", "Organization", "User"],
  endpoints: () => ({}),
})