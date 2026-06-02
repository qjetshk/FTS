import { baseApi } from "@/shared/api"
import type { Organization, OrgListItem } from "../model/organization.type"

const organizationApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getAllOrgs: build.query<OrgListItem[], void>({
      query: () => "/organizations/get-all",
      providesTags: ["Organization"],
    }),
    getOrgById: build.query<Organization, string>({
      query: (id) => `/organizations/get-by-id/${id}`,
      providesTags: ["Organization"],
    }),
    getFirstOrg: build.query<Organization, void>({
      query: () => "/organizations/get-first",
      providesTags: ["Organization"],
    }),
    validateApiKey: build.query<{ valid: boolean; error?: string }, void>({
      query: () => "/organizations/validate-api-key",
    }),
    updateOrganization: build.mutation<{ message: string }, {
      id: string
      ozonApiKey?: string
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
  useGetAllOrgsQuery,
  useGetOrgByIdQuery,
  useGetFirstOrgQuery,
  useValidateApiKeyQuery,
  useUpdateOrganizationMutation,
  useUpdateDeclarantMutation,
  useCreateDocumentMutation,
  useCompanyInfoMutation,
  useClassifyMutation,
} = organizationApi
