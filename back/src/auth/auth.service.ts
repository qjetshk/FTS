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
import { PLAN, PLAN_STATUS } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ─── Register ────────────────────────────────────────────────────────────────

  async register(dto: RegisterDto, res: Response, userAgent?: string, ipAddress?: string) {
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

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        avatarUrl: `https://api.dicebear.com/10.x/lorelei-neutral/svg?backgroundColorFillStops=3&backgroundColorAngle=112&backgroundColor=e2e8f0&seed=${user.id}`,
      },
    });

    return this.issueTokens(user.id, res, userAgent, ipAddress);
  }

  // ─── Login ────────────────────────────────────────────────────────────────────

  async login(dto: LoginDto, res: Response, userAgent?: string, ipAddress?: string) {
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

    return this.issueTokens(user.id, res, userAgent, ipAddress);
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

  async refresh(
    userId: string,
    oldRefreshToken: string,
    res: Response,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // Rotation: update token in-place so session count stays stable
    const refreshExpire =
      this.config.getOrThrow<StringValue>('JWT_REFRESH_EXPIRE');
    const payload: JwtPayload = { id: userId };
    const newRefreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpire,
    });
    const expiresAt = new Date(Date.now() + convertExpireTime(refreshExpire));

    await this.prisma.refreshToken.update({
      where: { token: oldRefreshToken },
      data: {
        token: newRefreshToken,
        expiresAt,
        ...(userAgent && { userAgent }),
        ...(ipAddress && { ipAddress }),
      },
    });

    const accessExpire =
      this.config.getOrThrow<StringValue>('JWT_ACCESS_EXPIRE');
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: accessExpire,
    });

    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: convertExpireTime(refreshExpire),
      path: '/',
    });

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, name: true, plan: true, planStatus: true,
        planExpiresAt: true, createdAt: true, avatarUrl: true, isOnboardingComplete: true,
      },
    });

    return { accessToken, user };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  private parseDevice(userAgent: string | undefined): string {
    if (!userAgent) return 'Неизвестное устройство';
    if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'Мобильный браузер';
    if (/edg\//i.test(userAgent)) return 'Microsoft Edge';
    if (/opr\//i.test(userAgent)) return 'Opera';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/safari/i.test(userAgent)) return 'Safari';
    return 'Браузер';
  }

  private async issueTokens(
    userId: string,
    res: Response,
    userAgent?: string,
    ipAddress?: string,
  ) {
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

    const expiresAt = new Date(Date.now() + convertExpireTime(refreshExpire));

    // Upsert by (userId + userAgent): one session per browser/device
    const existing = userAgent
      ? await this.prisma.refreshToken.findFirst({
          where: { userId, userAgent, isRevoked: false },
        })
      : null;

    if (existing) {
      await this.prisma.refreshToken.update({
        where: { id: existing.id },
        data: { token: refreshToken, expiresAt, isRevoked: false },
      });
    } else {
      await this.prisma.refreshToken.create({
        data: { token: refreshToken, userId, expiresAt, userAgent, ipAddress },
      });
    }

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: true, // sameSite: "none" requires secure; ngrok always serves https
      sameSite: "none",
      maxAge: convertExpireTime(refreshExpire),
      path: '/',
    });

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
        avatarUrl: true,
        isOnboardingComplete: true,
      },
    });

    return { accessToken, user };
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
        avatarUrl: true,
        isOnboardingComplete: true,
      },
    });

    if (!user) throw new UnauthorizedException('Пользователь не найден');

    return user;
  }

  async updateProfile(userId: string, dto: { name: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { name: dto.name },
      select: {
        id: true,
        email: true,
        name: true,
        plan: true,
        planStatus: true,
        planExpiresAt: true,
        createdAt: true,
        avatarUrl: true,
        isOnboardingComplete: true,
      },
    });
    return user;
  }

  async completeOnboarding(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboardingComplete: true },
    });
    return { message: 'Онбординг завершён' };
  }

  async resetOnboarding(userId: string) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isOnboardingComplete: false },
    });
    return { message: 'Онбординг сброшен' };
  }

  async getSessions(userId: string) {
    const now = new Date();
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: now } },
      select: { id: true, createdAt: true, expiresAt: true, userAgent: true },
      orderBy: { createdAt: 'desc' },
    });
    return tokens.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
      deviceName: this.parseDevice(t.userAgent ?? undefined),
    }));
  }

  async revokeOtherSessions(userId: string, currentToken: string) {
    await this.prisma.refreshToken.updateMany({
      where: { userId, token: { not: currentToken }, isRevoked: false },
      data: { isRevoked: true },
    });
    return { message: 'Другие сессии завершены' };
  }

  async getStats(userId: string) {
    const [organizations, products, statforms] = await Promise.all([
      this.prisma.organization.count({ where: { userId } }),
      this.prisma.product.count({ where: { organization: { userId } } }),
      this.prisma.statFormRun.count({ where: { organization: { userId } } }),
    ]);
    return { organizations, products, statforms };
  }
}
