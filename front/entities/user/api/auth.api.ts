import { baseApi } from "@/shared/api"
import type { AuthResponse, NotificationChannel, User } from "../model/user.type"
import type { ProfileNameValues } from "../model/profile-name.schema"

type RequestCodeBody = { email: string }
type VerifyCodeBody = { email: string; code: string }

export type Session = { id: string; createdAt: string; expiresAt: string; deviceName: string; isCurrent: boolean }
export type TelegramLink = { url: string; expiresIn: number }
export type TelegramLoginStart = TelegramLink & { token: string }
export type TelegramLoginPoll =
  | { status: "pending" | "cancelled" }
  | ({ status: "ok" } & AuthResponse)
export type UserStats = { organizations: number; products: number; statforms: number }

const authApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    requestCode: build.mutation<{ message: string }, RequestCodeBody>({
      query: (body) => ({ url: "/auth/email/request-code", method: "POST", body }),
    }),
    verifyCode: build.mutation<AuthResponse, VerifyCodeBody>({
      query: (body) => ({ url: "/auth/email/verify-code", method: "POST", body }),
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
    updateProfile: build.mutation<User, ProfileNameValues>({
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
    telegramLoginStart: build.mutation<TelegramLoginStart, void>({
      query: () => ({ url: "/auth/telegram/start", method: "POST" }),
    }),
    telegramLoginPoll: build.mutation<TelegramLoginPoll, { token: string }>({
      query: (body) => ({ url: "/auth/telegram/poll", method: "POST", body }),
    }),
    requestEmailLinkCode: build.mutation<{ message: string }, RequestCodeBody>({
      query: (body) => ({ url: "/auth/email/link/request-code", method: "POST", body }),
    }),
    verifyEmailLink: build.mutation<User, VerifyCodeBody>({
      query: (body) => ({ url: "/auth/email/link/verify-code", method: "POST", body }),
      invalidatesTags: ["User"],
    }),
    updateNotificationChannel: build.mutation<User, { channel: NotificationChannel }>({
      query: (body) => ({ url: "/auth/notifications", method: "PATCH", body }),
      invalidatesTags: ["User"],
    }),
    createTelegramLink: build.mutation<TelegramLink, void>({
      query: () => ({ url: "/telegram/link", method: "POST" }),
    }),
    unlinkTelegram: build.mutation<{ linked: false }, void>({
      query: () => ({ url: "/telegram/link", method: "DELETE" }),
      invalidatesTags: ["User"],
    }),
    getStats: build.query<UserStats, void>({
      query: () => "/auth/stats",
      providesTags: ["Stats"],
    }),
  }),
})

export const {
  useRequestCodeMutation,
  useVerifyCodeMutation,
  useLogoutMutation,
  useMeQuery,
  useCompleteOnboardingMutation,
  useResetOnboardingMutation,
  useUpdateProfileMutation,
  useGetSessionsQuery,
  useRevokeOtherSessionsMutation,
  useGetStatsQuery,
  useCreateTelegramLinkMutation,
  useUnlinkTelegramMutation,
  useTelegramLoginStartMutation,
  useTelegramLoginPollMutation,
  useRequestEmailLinkCodeMutation,
  useVerifyEmailLinkMutation,
  useUpdateNotificationChannelMutation,
} = authApi
