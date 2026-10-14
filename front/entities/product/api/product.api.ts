import { baseApi } from "@/shared/api"
import type { GetProductsResponse, ProductSnapshot, ProductsSyncState, TnvedStatus } from "../model/product.type"

const productApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getProducts: build.query<GetProductsResponse, { clientId: number; page?: number; limit?: number }>({
      query: ({ clientId, page = 1, limit = 20 }) =>
        `/products/get-all?clientId=${clientId}&page=${page}&limit=${limit}`,
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
