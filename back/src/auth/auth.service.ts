import { BadRequestException, ConflictException, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { EmailProducerService } from 'src/email-producer/email-producer.service';
import { EmailCodeService } from './email-code.service';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { JwtPayload, StringValue } from './interfaces/jwt.interface';
import { convertExpireTime } from 'src/utils/convert-expire-time.util';
import { NOTIFICATION_CHANNEL, PLAN, PLAN_STATUS } from '@prisma/client';
import { TelegramService } from 'src/telegram/telegram.service';
import { escapeHtml } from 'src/telegram/telegram.format';
import { USER_VIEW_SELECT, toUserView } from './user-view';
import { hashToken } from './token-hash';

export type TelegramIdentity = { chatId: bigint; username: string | null; name: string };

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
    private redis: RedisService,
    private emailProducer: EmailProducerService,
    private emailCode: EmailCodeService,
    private telegram: TelegramService,
  ) {}

  // На проде COOKIE_DOMAIN=.easyfts.ru: cookie видят и api., и app. (middleware фронта проверяет вход на сервере).
  // В dev пусто — cookie только хоста бэка. sameSite none → обязателен secure (ngrok/прод всегда https)
  private cookieOptions() {
    return {
      httpOnly: true,
      secure: true,
      sameSite: 'none' as const,
      path: '/',
      domain: this.config.get<string>('COOKIE_DOMAIN') || undefined,
    };
  }

  // ─── Email code (вход = регистрация) ──────────────────────────────────────────

  async requestCode(dto: RequestCodeDto, ipAddress?: string) {
    const code = await this.emailCode.issue(dto.email, ipAddress);
    await this.emailProducer.sendLoginCode(dto.email, code);
    // одинаковый ответ независимо от того, есть ли аккаунт
    return { message: 'Код отправлен' };
  }

  async verifyCode(dto: VerifyCodeDto, res: Response, userAgent?: string, ipAddress?: string) {
    await this.emailCode.consume(dto.email, dto.code);

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    const user = existing ?? (await this.createUser({ email: dto.email }));

    if (!user.isEmailVerified) {
      await this.prisma.user.update({ where: { id: user.id }, data: { isEmailVerified: true } });
    }

    if (!existing) {
      this.emailProducer.sendWelcome(dto.email).catch((e) =>
        this.logger.error(`welcome email failed: ${e.message}`),
      );
      void this.telegram.alertAdmin(`🆕 Новый пользователь: ${escapeHtml(dto.email)}`);
    }

    return this.issueTokens(user.id, res, userAgent, ipAddress);
  }

  // ─── Telegram (вход = регистрация, почта не нужна) ────────────────────────────

  // подтверждение в боте проверяет TelegramLoginService; сюда приходит уже проверенный chat_id
  async loginWithTelegram(tg: TelegramIdentity, res: Response, userAgent?: string, ipAddress?: string) {
    const existing = await this.prisma.user.findUnique({ where: { telegramChatId: tg.chatId } });
    const user = existing
      ? await this.prisma.user.update({ where: { id: existing.id }, data: { telegramUsername: tg.username } })
      : await this.createUser({ name: tg.name || null, telegramChatId: tg.chatId, telegramUsername: tg.username });

    if (!existing) {
      const who = tg.username ? `@${tg.username}` : escapeHtml(tg.name);
      void this.telegram.alertAdmin(`🆕 Новый пользователь через Telegram: ${who}`);
    }
    return this.issueTokens(user.id, res, userAgent, ipAddress);
  }

  // ─── Привязка почты к аккаунту без неё (зарегистрировался через Telegram) ────────

  async requestEmailLinkCode(userId: string, email: string, ipAddress?: string) {
    await this.assertEmailFree(userId, email);
    const code = await this.emailCode.issue(email, ipAddress);
    await this.emailProducer.sendLoginCode(email, code);
    return { message: 'Код отправлен' };
  }

  async verifyEmailLink(userId: string, email: string, code: string) {
    await this.emailCode.consume(email, code);
    // повторная проверка: почту могли занять, пока шёл код
    await this.assertEmailFree(userId, email);
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { email, isEmailVerified: true },
      select: USER_VIEW_SELECT,
    });
    return toUserView(user);
  }

  // ─── Канал уведомлений ─────────────────────────────────────────────────────

  async updateNotificationChannel(userId: string, channel: NOTIFICATION_CHANNEL) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, telegramChatId: true },
    });
    if (!user) throw new UnauthorizedException('Пользователь не найден');
    if (channel !== 'EMAIL' && !user.telegramChatId) throw new BadRequestException('Сначала привяжите Telegram');
    if (channel !== 'TELEGRAM' && !user.email) throw new BadRequestException('Сначала привяжите почту');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { notificationChannel: channel },
      select: USER_VIEW_SELECT,
    });
    return toUserView(updated);
  }

  // без автослияния аккаунтов: занятая почта = другой аккаунт, юзер решает сам
  private async assertEmailFree(userId: string, email: string) {
    const owner = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (owner && owner.id !== userId) {
      throw new ConflictException('Эта почта уже используется другим аккаунтом easyfts — войдите в него по коду на почту');
    }
  }

  private async createUser(data: {
    email?: string;
    name?: string | null;
    telegramChatId?: bigint;
    telegramUsername?: string | null;
  }) {
    const trialDays = 7;
    const planExpiresAt = new Date();
    planExpiresAt.setDate(planExpiresAt.getDate() + trialDays);

    const user = await this.prisma.user.create({
      data: {
        ...data,
        isEmailVerified: !!data.email,
        plan: PLAN.TRIAL,
        planStatus: PLAN_STATUS.ACTIVE,
        planExpiresAt,
        trialStartedAt: new Date(),
      },
    });

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        avatarUrl: `https://api.dicebear.com/10.x/lorelei-neutral/svg?backgroundColorFillStops=3&backgroundColorAngle=112&backgroundColor=e2e8f0&seed=${user.id}`,
      },
    });
  }

  // ─── Logout ───────────────────────────────────────────────────────────────────

  async logout(userId: string, refreshToken: string, res: Response) {
    // Отзываем конкретный refresh токен
    await this.prisma.refreshToken.updateMany({
      where: { userId, token: hashToken(refreshToken), isRevoked: false },
      data: { isRevoked: true },
    });

    res.clearCookie('refresh_token', this.cookieOptions());

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
    const jti = randomUUID();
    const payload: JwtPayload = { id: userId, jti };
    const newRefreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: refreshExpire,
    });
    const expiresAt = new Date(Date.now() + convertExpireTime(refreshExpire));

    await this.prisma.refreshToken.update({
      where: { token: hashToken(oldRefreshToken) },
      data: {
        token: hashToken(newRefreshToken),
        expiresAt,
        accessJti: jti,
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

    res.cookie('refresh_token', newRefreshToken, { ...this.cookieOptions(), maxAge: convertExpireTime(refreshExpire) });

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: USER_VIEW_SELECT });

    return { accessToken, user: user && toUserView(user) };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────────

  parseDevice(userAgent: string | undefined): string {
    if (!userAgent) return 'Неизвестное устройство';
    if (/mobile|android|iphone|ipad/i.test(userAgent)) return 'Мобильный браузер';
    if (/edg\//i.test(userAgent)) return 'Microsoft Edge';
    if (/opr\//i.test(userAgent)) return 'Opera';
    if (/firefox/i.test(userAgent)) return 'Firefox';
    if (/chrome/i.test(userAgent)) return 'Chrome';
    if (/safari/i.test(userAgent)) return 'Safari';
    return 'Браузер';
  }

  async issueTokens(
    userId: string,
    res: Response,
    userAgent?: string,
    ipAddress?: string,
  ) {
    // jti — уникальный ID этого конкретного access token.
    // Храним его в RefreshToken, чтобы при revoke знать что именно заблокировать в Redis.
    const jti = randomUUID();
    const payload: JwtPayload = { id: userId, jti };

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
        data: { token: hashToken(refreshToken), expiresAt, isRevoked: false, accessJti: jti },
      });
    } else {
      await this.prisma.refreshToken.create({
        data: { token: hashToken(refreshToken), userId, expiresAt, userAgent, ipAddress, accessJti: jti },
      });
    }

    res.cookie('refresh_token', refreshToken, { ...this.cookieOptions(), maxAge: convertExpireTime(refreshExpire) });

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: USER_VIEW_SELECT });

    return { accessToken, user: user && toUserView(user) };
  }

  // ─── Me ───────────────────────────────────────────────────────────────────────

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: USER_VIEW_SELECT });
    if (!user) throw new UnauthorizedException('Пользователь не найден');
    return toUserView(user);
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

  async getSessions(userId: string, currentToken: string) {
    const now = new Date();
    const tokens = await this.prisma.refreshToken.findMany({
      where: { userId, isRevoked: false, expiresAt: { gt: now } },
      select: { id: true, createdAt: true, expiresAt: true, userAgent: true, token: true },
      orderBy: { createdAt: 'desc' },
    });
    return tokens.map((t) => ({
      id: t.id,
      createdAt: t.createdAt,
      expiresAt: t.expiresAt,
      deviceName: this.parseDevice(t.userAgent ?? undefined),
      isCurrent: t.token === hashToken(currentToken),
    }));
  }

  async revokeOtherSessions(userId: string, currentToken: string) {
    // Берём jti всех других сессий до того как их отзовём
    const accessExpire = this.config.getOrThrow<StringValue>('JWT_ACCESS_EXPIRE');
    const ttl = Math.ceil(convertExpireTime(accessExpire) / 1000);

    const others = await this.prisma.refreshToken.findMany({
      where: { userId, token: { not: hashToken(currentToken) }, isRevoked: false },
      select: { accessJti: true },
    });

    // Помечаем в БД как отозванные
    await this.prisma.refreshToken.updateMany({
      where: { userId, token: { not: hashToken(currentToken) }, isRevoked: false },
      data: { isRevoked: true },
    });

    // Кладём каждый jti в Redis blacklist на время жизни access token.
    // После этого guard отклонит запросы из других браузеров немедленно.
    await Promise.all(
      others
        .filter((t) => t.accessJti)
        .map((t) => this.redis.blacklist(t.accessJti!, ttl)),
    );

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
