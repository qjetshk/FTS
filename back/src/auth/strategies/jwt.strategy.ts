import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { JwtPayload } from '../interfaces/jwt.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
    });
  }

  async validate(payload: JwtPayload) {
    // Если jti есть в Redis blacklist — сессия была принудительно завершена
    if (payload.jti && await this.redis.isBlacklisted(payload.jti)) {
      throw new UnauthorizedException('Сессия завершена');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, plan: true, planStatus: true },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');

    return user;
  }
}