import type { ThunkDispatch, UnknownAction } from "@reduxjs/toolkit"
import { baseApi } from "@/shared/api"
import type { StatFormRun, RunStatformsBody, RunStatformsResponse } from "../model/statform.type"

const statformApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // кэш — отдельно на каждую организацию (аргумент = orgId)
    getStatformRuns: build.query<StatFormRun[], string>({
      query: (orgId) => ({ url: "/statforms", params: { orgId } }),
      providesTags: ["Statform"],
    }),
    runStatforms: build.mutation<RunStatformsResponse, RunStatformsBody>({
      query: (body) => ({ url: "/statforms/run", method: "POST", body }),
      invalidatesTags: ["Statform"],
    }),
    // генерация по CSV-отчёту OZON, который юзер выгрузил сам; бэк проверяет, что отчёт ровно за period
    runStatformsUpload: build.mutation<RunStatformsResponse, RunStatformsBody & { file: File }>({
      query: ({ period, orgId, file }) => {
        const body = new FormData()
        body.append("period", period)
        body.append("orgId", orgId)
        body.append("file", file)
        return { url: "/statforms/run-upload", method: "POST", body }
      },
      invalidatesTags: ["Statform"],
    }),
  }),
})

export const { useGetStatformRunsQuery, useRunStatformsMutation, useRunStatformsUploadMutation } = statformApi

// Свежее состояние прогона из SSE → в кэш списка его организации без перезапроса (новый прогон — в начало).
// SSE идёт по юзеру, поэтому прогоны других орг попадают только в их кэш, а не в открытый список
export const upsertStatformRun = (run: StatFormRun) =>
  statformApi.util.updateQueryData("getStatformRuns", run.organizationId, (draft) => {
    const i = draft.findIndex((r) => r.id === run.id)
    if (i === -1) draft.unshift(run)
    else draft[i] = run
  })

type StatformRootState = Parameters<ReturnType<typeof statformApi.endpoints.getStatformRuns.select>>[0]

// dispatch, который принимает thunk-и RTK Query (upsertStatformRun) — без импорта store из слоя app
export type StatformApiDispatch = ThunkDispatch<StatformRootState, unknown, UnknownAction>
