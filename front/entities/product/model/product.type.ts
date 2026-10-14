export type TnvedStatus = "CLASSIFIED" | "NEEDS_REVIEW" | "VERIFIED_BY_USER" | "VERIFIED_BY_LLM"

export type TnvedAlternative = {
  id: string
  tnvedCode: string
  tnvedName: string | null
  tnvedUnit: string | null
}

export type Product = {
  id: string
  productId: number
  offerId: string
  sku: number
  name: string
  description: string | null
  category: string
  categoryPath: string
  primaryImg: string | null
  images: string[]
  country: string | null
  countriesOfOrigin: string[]
  countryConflict: boolean
  tnvedCode: string | null
  tnvedName: string | null
  tnvedUnit: string | null
  tnvedStatus: TnvedStatus | null
  tnvedAlternatives: TnvedAlternative[]
  organizationId: string | null
  createdAt: string
  updatedAt: string
}

export type ProductSnapshot = {
  productId: number
  sku: number
  name: string
  categoryPath: string
  tnvedStatus: TnvedStatus | null
  tnvedCode: string | null
  country: string | null
  countryConflict: boolean
}

export type GetProductsResponse = {
  items: Product[]
  total: number
  page: number
  limit: number
}

export type PendingTnved = {
  tnvedCode: string
  tnvedName: string | null
  tnvedUnit: string | null
}

// ozon_auth — OZON отклонил API-ключ; failed — прочий сбой синхронизации
export type ProductsSyncError = "ozon_auth" | "failed"

export type ProductsSyncState = {
  productsSyncStatus: "RUNNING" | "DONE" | "FAILED" | null
  productsSyncError: ProductsSyncError | null
  productsSyncStartedAt: string | null
  productsSyncedAt: string | null
}
