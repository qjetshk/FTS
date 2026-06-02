import { baseApi } from "@/shared/api"
import type { AuthResponse, User } from "../model/user.type"
import type { LoginFormValues } from "../model/login.schema"
import type { RegisterFormValues } from "../model/register.schema"

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
  }),
})

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useMeQuery,
  useCompleteOnboardingMutation,
  useResetOnboardingMutation,
} = authApi
