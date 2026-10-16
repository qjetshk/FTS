export type { User, AuthResponse, UserPlan, UserPlanStatus, NotificationChannel } from "./model/user.type"
export {
  emailSchema,
  codeSchema,
  type EmailFormValues,
  type CodeFormValues,
} from "./model/email-code.schema"
export { profileNameSchema, type ProfileNameValues } from "./model/profile-name.schema"
export {
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
  useTelegramWebAppLoginMutation,
  useRequestEmailLinkCodeMutation,
  useVerifyEmailLinkMutation,
  useUpdateNotificationChannelMutation,
  type Session,
  type TelegramLoginPoll,
  type TelegramLink,
  type UserStats,
} from "./api/auth.api"
export { useUser } from "./lib/use-user.lib"
export { userContact } from "./lib/user-contact.util"
