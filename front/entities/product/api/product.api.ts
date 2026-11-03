import { baseApi } from "@/shared/api"
import type { GetProductsResponse, ProductSnapshot, ProductsSyncState, ProductView, TnvedStatus } from "../model/product.type"

const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // view: attention — нужна правка (isNeedsAttention), ok — остальные; фильтр и страницы считает бэк
    getProducts: build.query<GetProductsResponse, { clientId: number; page?: number; limit?: number; view?: ProductView }>({
      query: ({ clientId, page = 1, limit = 20, view }) =>
        `/products/get-all?clientId=${clientId}&page=${page}&limit=${limit}${view ? `&view=${view}` : ""}`,
      providesTags: ["Product"],
    }),
    getProductsSnapshot: build.query<ProductSnapshot[], number>({
      query: (clientId) => `/products/snapshot-user/${clientId}`,
      providesTags: ["Product"],
    }),
    getProductsSyncStatus: build.query<ProductsSyncState, number>({
      query: (clientId) => `/products/sync-status/${clientId}`,
    }),
    updateTnved: build.mutation<void, {
      productId: number
      clientId: number
      tnvedCode: string
      tnvedName: string | null
      tnvedUnit: string | null
      tnvedStatus: TnvedStatus
      tnvedAlternatives?: { tnvedCode: string; tnvedName: string | null; tnvedUnit: string | null }[]
    }>({
      query: (body) => ({ url: "/products/update-tnved", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
    verifyAllTnved: build.mutation<{ message: string }, { clientId: number }>({
      query: (body) => ({ url: "/products/verify-all", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
    updateCountry: build.mutation<{ message: string }, { productId: number; clientId: number; country: string }>({
      query: (body) => ({ url: "/products/update-country", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useGetProductsSnapshotQuery,
  useGetProductsSyncStatusQuery,
  useUpdateTnvedMutation,
  useVerifyAllTnvedMutation,
  useUpdateCountryMutation,
} = productApi
