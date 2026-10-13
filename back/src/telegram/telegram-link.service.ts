import { BadRequestException, Injectable, Logger, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import type { Context } from 'grammy';
import type { RUN_STATUS } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { TelegramService } from './telegram.service';
import { countryName, escapeHtml, formatPeriod } from './telegram.format';

const LINK_TTL = 10 * 60;
export const LINK_PREFIX = 'link_';
const linkKey = (token: string) => `tg-link:${token}`;

const RUN_STATUS_LABEL: Record<RUN_STATUS, string> = {
  PENDING: '⏳ в очереди',
  BUILDING: '⚙️ формируется',
  READY: '✅ готово',
  PARTIAL: '⚠️ частично',
  FAILED: '❌ ошибка',
  NEEDS_REVIEW: '🔎 нужна проверка ТН ВЭД',
};

const NO_EMAIL_UNLINK = 'Сначала привяжите почту в разделе «Аккаунт» — иначе вы не сможете войти в easyfts.';

// как называть аккаунт в сообщениях: почта, а у вошедших через Telegram без почты — имя
const accountLabel = (u: { email: string | null; name: string | null }) => u.email ?? u.name ?? 'easyfts';

// Привязка: кабинет выдаёт ссылку t.me/<bot>?start=link_<token> → юзер жмёт Start → бот находит юзера по токену в Redis
@Injectable()
export class TelegramLinkService implements OnModuleInit {
  private readonly logger = new Logger(TelegramLinkService.name);

  constructor(
    private telegram: TelegramService,
    private prisma: PrismaService,
    private redis: RedisService,
    private config: ConfigService,
  ) {}

  onModuleInit() {
    const { handlers, fallback } = this.telegram;
    handlers.command('start').filter(
      (ctx) => typeof ctx.match === 'string' && ctx.match.startsWith(LINK_PREFIX),
      (ctx) => this.onLinkStart(ctx, String(ctx.match).slice(LINK_PREFIX.length)),
    );
    handlers.command('unlink', (ctx) => this.onUnlink(ctx));
    handlers.command('status', (ctx) => this.onStatus(ctx));
    handlers.command('help', (ctx) => this.onHelp(ctx));
    // /start без токена и любое другое сообщение
    fallback.on('message', (ctx) => this.onHelp(ctx));
  }

  private get frontendUrl() {
    return this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  async createLink(userId: string) {
    const username = this.telegram.username;
    if (!username) throw new ServiceUnavailableException('Telegram-бот сейчас недоступен, попробуйте позже');

    // base64url — допустимые символы для start-параметра (A-Z a-z 0-9 _ -, до 64)
    const token = randomBytes(24).toString('base64url');
    await this.redis.set(linkKey(token), userId, LINK_TTL);
    return { url: `https://t.me/${username}?start=${LINK_PREFIX}${token}`, expiresIn: LINK_TTL };
  }

  async unlink(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true, email: true },
    });
    if (!user?.telegramChatId) return { linked: false };
    if (!user.email) throw new BadRequestException(NO_EMAIL_UNLINK);

    await this.prisma.user.update({ where: { id: userId }, data: { telegramChatId: null, telegramUsername: null } });
    await this.telegram
      .sendMessage(user.telegramChatId, 'Telegram отвязан от аккаунта easyfts — уведомления сюда больше не придут.')
      .catch((e) => this.logger.warn(`Unlink notice failed: ${(e as Error).message}`));
    return { linked: false };
  }

  private async onLinkStart(ctx: Context, token: string) {
    const userId = await this.redis.get(linkKey(token));
    if (!userId) {
      await ctx.reply('Ссылка устарела. Откройте «Аккаунт» в личном кабинете easyfts и нажмите «Привязать Telegram» ещё раз.');
      return;
    }
    const chatId = BigInt(ctx.chat!.id);
    // чат — единственный способ входа в другой (телеграм-) аккаунт: перенос оставит тот аккаунт без входа
    const owner = await this.prisma.user.findUnique({ where: { telegramChatId: chatId }, select: { id: true, email: true } });
    if (owner && owner.id !== userId && !owner.email) {
      await ctx.reply(
        'Этот Telegram уже используется для входа в другой аккаунт easyfts без почты. ' +
          'Войдите в него через Telegram и привяжите почту — тогда Telegram можно будет перенести.',
      );
      return;
    }
    await this.redis.del(linkKey(token));
    const user = await this.bind(userId, chatId, ctx.from?.username ?? null);
    await ctx.reply(
      `Готово! Telegram привязан к аккаунту <b>${escapeHtml(accountLabel(user))}</b>.\n\n` +
        'Сюда будут приходить готовые статформы и важные уведомления. Последние статформы — /status.',
      { parse_mode: 'HTML' },
    );
  }

  private async onUnlink(ctx: Context) {
    const chatId = BigInt(ctx.chat!.id);
    const user = await this.prisma.user.findUnique({ where: { telegramChatId: chatId }, select: { id: true, email: true } });
    if (!user) {
      await ctx.reply('Этот чат не привязан ни к одному аккаунту.');
      return;
    }
    if (!user.email) {
      await ctx.reply(NO_EMAIL_UNLINK);
      return;
    }
    await this.prisma.user.update({ where: { id: user.id }, data: { telegramChatId: null, telegramUsername: null } });
    await ctx.reply('Telegram отвязан — уведомления сюда больше не придут.');
  }

  // последний прогон по каждой организации юзера
  private async onStatus(ctx: Context) {
    const user = await this.prisma.user.findUnique({
      where: { telegramChatId: BigInt(ctx.chat!.id) },
      select: {
        organizations: {
          select: {
            fullOrg: true,
            statFormRuns: {
              orderBy: { period: 'desc' },
              take: 3,
              select: { period: true, status: true, detectedCountries: true },
            },
          },
        },
      },
    });
    if (!user) {
      await this.onHelp(ctx);
      return;
    }
    if (!user.organizations.length) {
      await ctx.reply('Организаций пока нет — добавьте её в личном кабинете.');
      return;
    }

    const blocks = user.organizations.map((org) => {
      const runs = org.statFormRuns.length
        ? org.statFormRuns
            .map((r) => {
              const countries = r.detectedCountries.length ? ` · ${r.detectedCountries.map(countryName).join(', ')}` : '';
              return `${formatPeriod(r.period)} — ${RUN_STATUS_LABEL[r.status]}${countries}`;
            })
            .join('\n')
        : 'Статформ ещё не было';
      return `<b>${escapeHtml(org.fullOrg)}</b>\n${runs}`;
    });
    await ctx.reply(`${blocks.join('\n\n')}\n\nСкачать XML: ${this.frontendUrl}/dashboard/statforms`, {
      parse_mode: 'HTML',
      link_preview_options: { is_disabled: true },
    });
  }

  private async onHelp(ctx: Context) {
    const user = await this.prisma.user.findUnique({
      where: { telegramChatId: BigInt(ctx.chat!.id) },
      select: { email: true, name: true },
    });
    if (user) {
      await ctx.reply(
        `Этот чат привязан к аккаунту <b>${escapeHtml(accountLabel(user))}</b>.\n\n` +
          'Сюда приходят готовые статформы (XML-файлами) и уведомления, если что-то пошло не так.\n\n' +
          '/status — последние статформы\n/unlink — отвязать Telegram',
        { parse_mode: 'HTML' },
      );
      return;
    }
    await ctx.reply(
      'Это бот easyfts — сюда приходят готовые статформы ЕАЭС и уведомления.\n\n' +
        `Войдите на сайте кнопкой «Войти через Telegram» или привяжите бота в разделе «Аккаунт»: ${this.frontendUrl}/login`,
      { link_preview_options: { is_disabled: true } },
    );
  }

  // чат уже привязан к другому аккаунту → переносим: юзер доказал доступ и к чату, и к аккаунту
  private async bind(userId: string, chatId: bigint, username: string | null) {
    const [, user] = await this.prisma.$transaction([
      this.prisma.user.updateMany({
        where: { telegramChatId: chatId, id: { not: userId } },
        data: { telegramChatId: null, telegramUsername: null },
      }),
      this.prisma.user.update({
        where: { id: userId },
        data: { telegramChatId: chatId, telegramUsername: username },
        select: { email: true, name: true },
      }),
    ]);
    this.logger.log(`User ${userId} linked chat ${chatId}`);
    return user;
  }
}
