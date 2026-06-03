import { baseApi } from "@/shared/api"
import type { StatFormRun, RunStatformsBody, RunStatformsResponse } from "../model/statform.type"

const statformApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStatformRuns: build.query<StatFormRun[], void>({
      query: () => "/statforms",
      providesTags: ["Statform"],
    }),
    runStatforms: build.mutation<RunStatformsResponse, RunStatformsBody>({
      query: (body) => ({ url: "/statforms/run", method: "POST", body }),
      invalidatesTags: ["Statform"],
    }),
  }),
})

export const { useGetStatformRunsQuery, useRunStatformsMutation } = statformApi
