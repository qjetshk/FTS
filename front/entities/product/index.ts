export type { Product, ProductSnapshot, TnvedAlternative, TnvedStatus, GetProductsResponse } from "./model/product.type"
export { TNVED_STATUS_CONFIG, isNeedsAttention, isGreen } from "./lib/tnved-status.lib"
export {
  useGetProductsQuery,
  useGetProductsSnapshotQuery,
  useUpdateTnvedMutation,
  useVerifyAllTnvedMutation,
  useUpdateCountryMutation,
} from "./api/product.api"
