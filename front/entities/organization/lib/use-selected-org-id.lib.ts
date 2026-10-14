import { useSearchParams } from "next/navigation"
import { useGetAllOrgsQuery } from "../api/organization.api"

// Организация, выбранная в бредкрамбе (?orgId=), иначе первая по дате создания — тот же порядок, что на бэке.
// undefined, пока список орг грузится. useSearchParams — вызывающая страница должна быть под <Suspense>
export function useSelectedOrgId(): string | undefined {
  const searchParams = useSearchParams()
  const { data: orgs } = useGetAllOrgsQuery()
  return searchParams?.get("orgId") ?? orgs?.[0]?.id
}
