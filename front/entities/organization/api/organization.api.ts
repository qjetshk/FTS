import { baseApi } from "@/shared/api"
import type { Organization } from "../model/organization.type"

const organizationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getFirstOrg: build.query<Organization, void>({
      query: () => "/organizations/get-first",
      providesTags: ["Organization"],
    }),
    updateOrganization: build.mutation<{ message: string }, {
      id: string
      fullAddress?: string
      country?: string
      region?: string
      city?: string
      street?: string
      house?: string
      room?: string
      postalCode?: string
    }>({
      query: (body) => ({ url: "/organizations/update", method: "PUT", body }),
      invalidatesTags: ["Organization"],
    }),
    updateDeclarant: build.mutation<{ message: string }, {
      id: string
      name?: string | null
      surname?: string | null
      patronymic?: string | null
      position?: string | null
      email?: string | null
      phone?: string | null
    }>({
      query: (body) => ({ url: "/organizations/declarant/update", method: "PUT", body }),
      invalidatesTags: ["Organization"],
    }),
    createDocument: build.mutation<{ message: string }, {
      declarantId: string
      typeCode: string
      typeShort: string
      series?: string | null
      number: string
      issuedBy: string
      issuedAt: string
    }>({
      query: (body) => ({ url: "/organizations/declarant/document/create", method: "POST", body }),
      invalidatesTags: ["Organization"],
    }),
    companyInfo: build.mutation<Organization, { apiKey: string; clientId: string; userId: string }>({
      query: (body) => ({ url: "/organizations/company-info", method: "POST", body }),
    }),
    classify: build.mutation<{ message: string }, { clientId: string }>({
      query: (body) => ({ url: "/organizations/classify", method: "POST", body }),
    }),
  }),
})

export const {
  useGetFirstOrgQuery,
  useUpdateOrganizationMutation,
  useUpdateDeclarantMutation,
  useCreateDocumentMutation,
  useCompanyInfoMutation,
  useClassifyMutation,
} = organizationApi
