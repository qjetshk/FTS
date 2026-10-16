import { createHmac, timingSafeEqual } from 'crypto';
import type { TelegramIdentity } from './auth.service';

// initData старше суток не принимаем — иначе перехваченную строку можно переиспользовать бесконечно
export const WEBAPP_INIT_DATA_TTL = 24 * 60 * 60;

// Проверка initData Mini App по алгоритму Telegram:
// secret = HMAC_SHA256(key "WebAppData", bot_token), hash = HMAC_SHA256(secret, отсортированные "key=value" через \n без hash).
// Возвращает пользователя или null, если подпись не сошлась, данные просрочены или в них нет user
export function verifyWebAppInitData(
  initData: string,
  botToken: string,
  now = Math.floor(Date.now() / 1000),
): TelegramIdentity | null {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  if (!hash || !/^[0-9a-f]{64}$/.test(hash)) return null;
  params.delete('hash');

  const dataCheck = [...params.entries()]
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join('\n');
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest();
  const expected = createHmac('sha256', secret).update(dataCheck).digest();
  if (!timingSafeEqual(expected, Buffer.from(hash, 'hex'))) return null;

  const authDate = Number(params.get('auth_date'));
  if (!Number.isFinite(authDate) || now - authDate > WEBAPP_INIT_DATA_TTL) return null;

  try {
    const user = JSON.parse(params.get('user') ?? '') as { id?: number; username?: string; first_name?: string; last_name?: string };
    if (!user.id) return null;
    // в личке с ботом chat_id совпадает с id пользователя
    return {
      chatId: BigInt(user.id),
      username: user.username ?? null,
      name: [user.first_name, user.last_name].filter(Boolean).join(' '),
    };
  } catch {
    return null;
  }
}
