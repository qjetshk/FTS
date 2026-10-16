import type { NOTIFICATION_CHANNEL } from '@prisma/client';

// Канал выбирает юзер, но выключить уведомления совсем нельзя: выбранный канал недоступен
// (Telegram отвязан/бот заблокирован, почты нет) → шлём в тот, что есть
export function deliveryTargets(user: { email: string | null; telegramChatId: bigint | null; notificationChannel: NOTIFICATION_CHANNEL }) {
  const wantEmail = user.notificationChannel !== 'TELEGRAM';
  const wantTelegram = user.notificationChannel !== 'EMAIL';
  const canEmail = !!user.email;
  const canTelegram = !!user.telegramChatId;
  return {
    email: canEmail && (wantEmail || !canTelegram) ? user.email : null,
    chatId: canTelegram && (wantTelegram || !canEmail) ? user.telegramChatId : null,
  };
}
