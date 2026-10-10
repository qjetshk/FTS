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

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.set(key, value, 'EX', ttlSeconds);
  }

  // перезаписать значение, сохранив оставшийся TTL
  async setKeepTtl(key: string, value: string): Promise<void> {
    await this.client.set(key, value, 'KEEPTTL');
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  // счётчик в окне: TTL ставится только при первом инкременте
  async incrWindow(key: string, windowSeconds: number): Promise<number> {
    const count = await this.client.incr(key);
    if (count === 1) await this.client.expire(key, windowSeconds);
    return count;
  }
}
