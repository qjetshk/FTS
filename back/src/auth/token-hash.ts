import { createHash } from 'crypto';

// refresh-токен живёт 60 дней — в БД только хэш: утечка базы не даёт войти в чужие сессии
export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');
