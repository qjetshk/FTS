import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
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

// Свежее состояние прогона из SSE → в кэш списка без перезапроса (новый прогон — в начало)
export const upsertStatformRun = (run: StatFormRun) =>
  statformApi.util.updateQueryData("getStatformRuns", undefined, (draft) => {
    const i = draft.findIndex((r) => r.id === run.id)
    if (i === -1) draft.unshift(run)
    else draft[i] = run
  })

export const selectStatformRuns = statformApi.endpoints.getStatformRuns.select()

// dispatch, который принимает thunk-и RTK Query (upsertStatformRun) — без импорта store из слоя app
export type StatformApiDispatch = ThunkDispatch<Parameters<typeof selectStatformRuns>[0], unknown, UnknownAction>
