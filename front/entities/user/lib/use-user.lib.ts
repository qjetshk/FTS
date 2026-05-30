import { useMeQuery } from "../api/auth.api"
import type { User } from "../model/user.type"

type UseUserReturn = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useUser(): UseUserReturn {
  const { data: user = null, isLoading } = useMeQuery()
  return {
    user,
    isLoading,
    isAuthenticated: !!user,
  }
}
