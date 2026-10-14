import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard, ThrottlerException } from '@nestjs/throttler';
import { timingSafeEqual } from 'crypto';

// Глобальный лимит запросов по IP. n8n (внутренний ключ) не ограничиваем:
// он шлёт товары поштучно — сотни запросов в минуту на одну синхронизацию каталога
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest();
    const key = req.headers?.['x-api-key'];
    const internal = process.env.INTERNAL_API_KEY;
    if (typeof key === 'string' && internal && key.length === internal.length && timingSafeEqual(Buffer.from(key), Buffer.from(internal))) {
      return true;
    }
    return super.shouldSkip(ctx);
  }

  protected async throwThrottlingException(): Promise<void> {
    throw new ThrottlerException('Слишком много запросов — подождите немного и повторите');
  }
}
