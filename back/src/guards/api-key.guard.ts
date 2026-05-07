import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  constructor(private config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const request = ctx.switchToHttp().getRequest();
    const key = request.headers['x-api-key'];

    if (key !== this.config.getOrThrow('INTERNAL_API_KEY')) {
      throw new UnauthorizedException('Неверный API ключ');
    }

    return true;
  }
}
