import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import * as argon2 from 'argon2';
import { PrismaService } from 'src/prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtPayload, StringValue } from './interfaces/jwt.interface';
import { convertExpireTime } from 'src/utils/convert-expire-time.util';
import { isDev } from 'src/utils/is-dev.util';
import { PLAN, PLAN_STATUS } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto, res: Response) {
    const exists = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (exists) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    const hash = await argon2.hash(dto.password);

    const trialDays = 7;
    const planExpiresAt = new Date();
    planExpiresAt.setDate(planExpiresAt.getDate() + trialDays);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        password: hash,
        plan: PLAN.TRIAL,
        planStatus: PLAN_STATUS.ACTIVE,
        planExpiresAt,
        trialStartedAt: new Date(),
      },
    });

    const setAvatar = await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarUrl: `https://api.dicebear.com/9.x/glass/svg?seed=${user.id}`,
      },
    });

    return this.issueTokens(user.id, res);
  }

  // ─── Login ────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, res: Response) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    const valid = await argon2.verify(user.password, dto.password);
    if (!valid) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    return this.issueTokens(user.id, res);
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async logout(userId: string, refreshToken: string, res: Response) {
    // Отзываем конкретный refresh токен
    await this.prisma.refreshToken.updateMany({
      where: { userId, token: refreshToken, isRevoked: false },
      data: { isRevoked: true },
    });

    res.clearCookie('refresh_token');

    return { message: 'Выход выполнен' };
  }

  // ─── Refresh ──────────────────────────────────────────────────────────────────

  async refresh(userId: string, oldRefreshToken: string, res: Response) {
    // Отзываем старый токен (rotation)
    await this.prisma.refreshToken.updateMany({
      where: { userId, token: oldRefreshToken },
      data: { isRevoked: true },
    });

    return this.issueTokens(userId, res);
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private async issueTokens(userId: string, res: Response) {
    const payload: JwtPayload = { id: userId };

    const accessExpire =
      this.config.getOrThrow<StringValue>('JWT_ACCESS_EXPIRE');
    const refreshExpire =
      this.config.getOrThrow<StringValue>('JWT_REFRESH_EXPIRE');

    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpire,
    });

    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpire,
    });

    // Сохраняем refresh токен в БД
    const expiresAt = new Date(Date.now() + convertExpireTime(refreshExpire));
    await this.prisma.refreshToken.create({
      data: { token: refreshToken, userId, expiresAt },
    });

    // Кладём refresh в httpOnly cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: !isDev(this.config),
      sameSite: isDev(this.config) ? 'lax' : 'strict',
      maxAge: convertExpireTime(refreshExpire),
      path: '/',
    });

    return { accessToken };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planStatus: true,
        planExpiresAt: true,
        createdAt: true,
      },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');

    return user;
  }
}
