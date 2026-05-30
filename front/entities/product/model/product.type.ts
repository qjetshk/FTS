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
}

export type GetProductsResponse = {
  items: Product[]
  total: number
  page: number
  limit: number
}
