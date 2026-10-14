export type Document = {
  id: string
  typeCode: string
  typeShort: string
  series: string | null
  number: string
  issuedBy: string
  issuedAt: string
  declarantId: string
  createdAt: string
  updatedAt: string
}

export type Declarant = {
  id: string
  name: string | null
  surname: string | null
  patronymic: string | null
  position: string | null
  phone: string | null
  email: string | null
  document: Document | null
}

export type Organization = {
  id: string
  ozonClientId: number
  ozonApiKey: string
  fullOrg: string
  fullOpf: string
  inn: string
  ogrn: string
  kpp: string | null
  okato5: string
  country: string
  region: string
  city: string
  street: string | null
  house: string | null
  room: string | null
  postalCode: string
  orgLang: string
  userId: string
  declarant: Declarant | null
  productsSyncedAt: string | null
  // синхронизация каталога + классификация ТН ВЭД; null — ни разу не запускалась
  productsSyncStatus: ProductsSyncStatus | null
  createdAt: string
  updatedAt: string
}

export type CompanyInfoResponse = Organization

export type OrgListItem = {
  id: string
  fullOrg: string
  inn: string
  ogrn: string
  fullOpf: string
}

export type ProductsSyncStatus = "RUNNING" | "DONE" | "FAILED"

export type OzonKeyCheck = { valid: true; expiresAt: string | null } | { valid: false; error: string }
