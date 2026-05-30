export type UserPlan = "TRIAL" | "BASIC" | "PRO"

export type User = {
  id: string
  email: string
  name: string
  plan: UserPlan
  planExpiresAt: string | null
  createdAt: string
  avatarUrl: string | null
}

export type AuthResponse = {
  user: User
  accessToken: string
}
