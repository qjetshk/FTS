import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  // Кладём jti в blacklist на ttlSeconds секунд.
  // Redis сам удалит ключ когда TTL истечёт — память не растёт бесконечно.
  async blacklist(jti: string, ttlSeconds: number): Promise<void> {
    await this.client.set(`blacklist:${jti}`, '1', 'EX', ttlSeconds);
  }

  // Проверяем: есть ли jti в blacklist?
  // EXISTS возвращает 1 (есть) или 0 (нет).
  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await this.client.exists(`blacklist:${jti}`);
    return result === 1;
  }
}
