export type { Product, ProductSnapshot, TnvedAlternative, TnvedStatus, GetProductsResponse, PendingTnved, ProductsSyncError, ProductsSyncState } from "./model/product.type"
export { TNVED_STATUS_CONFIG, isNeedsAttention, isGreen } from "./lib/tnved-status.lib"
export {
  useGetProductsQuery,
  useGetProductsSnapshotQuery,
  useGetProductsSyncStatusQuery,
  useUpdateTnvedMutation,
  useVerifyAllTnvedMutation,
  useUpdateCountryMutation,
} from "./api/product.api"
