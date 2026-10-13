import type { User } from "../model/user.type"

// подпись под именем: почта, а у вошедших через Telegram без почты — @username
export function userContact(user: Pick<User, "email" | "telegramUsername"> | null | undefined): string {
  if (!user) return ""
  if (user.email) return user.email
  return user.telegramUsername ? `@${user.telegramUsername}` : "Telegram"
}
