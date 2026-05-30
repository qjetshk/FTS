export type UserPlan = "TRIAL" | "BASIC" | "PRO"

export type User = {
  id: string
  email: string
  name: string
  plan: UserPlan
  planExpiresAt: string | null
  createdAt: string
}

export type AuthResponse = {
  user: User
  accessToken: string
  refreshToken: string
}
