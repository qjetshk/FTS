import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest();
    const key = request.headers['x-api-key'];
    const expected = this.config.getOrThrow<string>('INTERNAL_API_KEY');

    // сравнение за постоянное время — по времени ответа ключ не подобрать посимвольно
    const ok =
      typeof key === 'string' &&
      key.length === expected.length &&
      timingSafeEqual(Buffer.from(key), Buffer.from(expected));
    if (!ok) throw new UnauthorizedException('Неверный API ключ');

    return true;
  }
}
