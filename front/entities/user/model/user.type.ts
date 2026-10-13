export type UserPlan = "TRIAL" | "BASIC" | "PRO"
export type UserPlanStatus = "ACTIVE" | "EXPIRED" | "CANCELLED"

export type User = {
  id: string
  // null — вошёл через Telegram и ещё не привязал почту
  email: string | null
  // null до шага «как вас зовут» после первого входа
  name: string | null
  plan: UserPlan
  planStatus: UserPlanStatus
  planExpiresAt: string | null
  createdAt: string
  avatarUrl: string | null
  isOnboardingComplete: boolean
  // Telegram привязан — уведомления дублируются в бота
  telegramLinked: boolean
  telegramUsername: string | null
}

export type AuthResponse = {
  user: User
  accessToken: string
}
