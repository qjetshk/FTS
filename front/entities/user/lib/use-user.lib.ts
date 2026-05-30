import { useState, useEffect } from "react"
import type { User } from "../model/user.type"

type UseUserReturn = {
  user: User | null
  isAuthenticated: boolean
}

export function useUser(): UseUserReturn {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === "undefined") return null
    try {
      const raw = localStorage.getItem("user")
      return raw ? (JSON.parse(raw) as User) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "user") {
        try {
          setUser(e.newValue ? (JSON.parse(e.newValue) as User) : null)
        } catch {
          setUser(null)
        }
      }
    }
    window.addEventListener("storage", handleStorage)
    return () => window.removeEventListener("storage", handleStorage)
  }, [])

  return { user, isAuthenticated: !!user }
}
