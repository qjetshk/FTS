import type { Prisma } from '@prisma/client';

// Что отдаём фронту о юзере (/@me, вход, refresh) — один источник, чтобы ответы не расходились
export const USER_VIEW_SELECT = {
  id: true,
  email: true,
  name: true,
  plan: true,
  planStatus: true,
  planExpiresAt: true,
  createdAt: true,
  avatarUrl: true,
  isOnboardingComplete: true,
  telegramChatId: true,
  telegramUsername: true,
} satisfies Prisma.UserSelect;

type UserViewRow = Prisma.UserGetPayload<{ select: typeof USER_VIEW_SELECT }>;

// chat_id наружу не отдаём (BigInt и не нужен фронту) — только факт привязки
export function toUserView({ telegramChatId, ...rest }: UserViewRow) {
  return { ...rest, telegramLinked: telegramChatId !== null };
}
