import { baseApi } from "@/shared/api"
import type { SearchTnvedResponse } from "../model/tnved.type"

const tnvedApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    searchTnved: build.query<SearchTnvedResponse, { q: string; page?: number; limit?: number }>({
      query: ({ q, page = 1, limit = 20 }) =>
        `/tnved/search?q=${encodeURIComponent(q)}&page=${page}&limit=${limit}`,
    }),
  }),
})

export const { useSearchTnvedQuery, useLazySearchTnvedQuery } = tnvedApi
