import { BadRequestException, HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { createHash, randomInt, timingSafeEqual } from 'crypto';
import { RedisService } from 'src/redis/redis.service';

const CODE_TTL = 10 * 60; // код живёт 10 минут
const MAX_ATTEMPTS = 5; // после 5 неверных вводов код сгорает
const RESEND_COOLDOWN = 60; // повторная отправка на тот же email — раз в минуту
const IP_WINDOW = 60 * 60;
const IP_LIMIT = 20; // запросов кода с одного IP в час

type StoredCode = { hash: string; attempts: number };

@Injectable()
export class EmailCodeService {
  constructor(private redis: RedisService) {}

  // Генерирует код и возвращает его для отправки письмом. В Redis хранится только хэш.
  async issue(email: string, ip?: string): Promise<string> {
    const cooldownLeft = await this.redis.ttl(`otp:cooldown:${email}`);
    if (cooldownLeft > 0) {
      throw new HttpException(
        { message: `Повторно отправить код можно через ${cooldownLeft} с`, retryAfter: cooldownLeft },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    if (ip && (await this.redis.incrWindow(`otp:ip:${ip}`, IP_WINDOW)) > IP_LIMIT) {
      throw new HttpException('Слишком много запросов, попробуйте позже', HttpStatus.TOO_MANY_REQUESTS);
    }

    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const stored: StoredCode = { hash: this.hash(email, code), attempts: 0 };
    await this.redis.set(`otp:${email}`, JSON.stringify(stored), CODE_TTL);
    await this.redis.set(`otp:cooldown:${email}`, '1', RESEND_COOLDOWN);
    return code;
  }

  // Бросает 400, если код неверный/истёк; при успехе код удаляется (одноразовый).
  async consume(email: string, code: string): Promise<void> {
    const key = `otp:${email}`;
    const raw = await this.redis.get(key);
    if (!raw) throw new BadRequestException('Код истёк или не запрашивался — запросите новый');

    const stored = JSON.parse(raw) as StoredCode;
    const expected = Buffer.from(stored.hash, 'hex');
    const actual = Buffer.from(this.hash(email, code), 'hex');

    if (!timingSafeEqual(expected, actual)) {
      const attempts = stored.attempts + 1;
      if (attempts >= MAX_ATTEMPTS) {
        await this.redis.del(key);
        throw new BadRequestException('Слишком много неверных попыток — запросите новый код');
      }
      await this.redis.setKeepTtl(key, JSON.stringify({ ...stored, attempts }));
      throw new BadRequestException(`Неверный код, осталось попыток: ${MAX_ATTEMPTS - attempts}`);
    }

    await this.redis.del(key);
  }

  private hash(email: string, code: string): string {
    return createHash('sha256').update(`${email}:${code}`).digest('hex');
  }
}
