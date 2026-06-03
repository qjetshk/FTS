import { baseApi } from "@/shared/api"
import type { AuthResponse, User } from "../model/user.type"
import type { LoginFormValues } from "../model/login.schema"
import type { RegisterFormValues } from "../model/register.schema"

type UpdateProfileBody = { name: string }

export type Session = { id: string; createdAt: string; expiresAt: string; deviceName: string; isCurrent: boolean }
export type UserStats = { organizations: number; products: number; statforms: number }

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    login: build.mutation<AuthResponse, LoginFormValues>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
    }),
    register: build.mutation<AuthResponse, RegisterFormValues>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
    }),
    logout: build.mutation<void, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    me: build.query<User, void>({
      query: () => "/auth/@me",
      providesTags: ["User"],
    }),
    completeOnboarding: build.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/complete-onboarding", method: "POST" }),
      invalidatesTags: ["User"],
    }),
    resetOnboarding: build.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/reset-onboarding", method: "POST" }),
      invalidatesTags: ["User"],
    }),
    updateProfile: build.mutation<User, UpdateProfileBody>({
      query: (body) => ({ url: "/auth/profile", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    getSessions: build.query<Session[], void>({
      query: () => "/auth/sessions",
      providesTags: ["Sessions"],
    }),
    revokeOtherSessions: build.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/sessions/revoke-others", method: "POST" }),
      invalidatesTags: ["Sessions"],
    }),
    getStats: build.query<UserStats, void>({
      query: () => "/auth/stats",
      providesTags: ["Stats"],
    }),
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useMeQuery,
  useCompleteOnboardingMutation,
  useResetOnboardingMutation,
  useUpdateProfileMutation,
  useGetSessionsQuery,
  useRevokeOtherSessionsMutation,
  useGetStatsQuery,
} = authApi
