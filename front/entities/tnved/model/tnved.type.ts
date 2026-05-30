export type TnvedItem = {
  code: string
  name: string
  unit: string | null
}

export type SearchTnvedResponse = {
  items: TnvedItem[]
  total: number
  page: number
  limit: number
}
