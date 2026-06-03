export type UserPlan = "TRIAL" | "BASIC" | "PRO"
export type UserPlanStatus = "ACTIVE" | "EXPIRED" | "CANCELLED"

export type User = {
  id: string
  email: string
  name: string
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
