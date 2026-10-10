export type UserPlan = "TRIAL" | "BASIC" | "PRO"
export type UserPlanStatus = "ACTIVE" | "EXPIRED" | "CANCELLED"

export type User = {
  id: string
  email: string
  // null до шага «как вас зовут» после первого входа
  name: string | null
  plan: UserPlan
  planStatus: UserPlanStatus
  planExpiresAt: string | null
  createdAt: string
  avatarUrl: string | null
  isOnboardingComplete: boolean
}

export type AuthResponse = {
  user: User
  accessToken: string
}
