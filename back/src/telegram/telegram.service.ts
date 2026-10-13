import { Injectable, Logger, OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Bot, Composer, GrammyError, InputFile, type Context } from 'grammy';
import type { BotCommand, InlineKeyboardMarkup } from 'grammy/types';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { PrismaService } from 'src/prisma/prisma.service';

const RESTART_DELAY = 10_000;
const STOP_TIMEOUT = 3_000;

export type TelegramButton = { text: string; url: string };

// Telegram отклоняет URL-кнопки на localhost — в dev кнопки просто не показываем
const isPublicUrl = (url: string) => !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/.test(url);

function keyboard(buttons?: TelegramButton[]): InlineKeyboardMarkup | undefined {
  const usable = buttons?.filter((b) => isPublicUrl(b.url));
  return usable?.length ? { inline_keyboard: usable.map((b) => [b]) } : undefined;
}

// видимые команды в меню бота; админу дополнительно ADMIN_COMMANDS (только в его чате)
const USER_COMMANDS: BotCommand[] = [
  { command: 'status', description: 'Последние статформы' },
  { command: 'help', description: 'Что умеет бот' },
  { command: 'unlink', description: 'Отвязать Telegram от аккаунта' },
];
export const ADMIN_COMMANDS: BotCommand[] = [
  { command: 'stats', description: 'Админ: пользователи и прогоны' },
  { command: 'runs', description: 'Админ: проблемные прогоны' },
  { command: 'queues', description: 'Админ: очереди BullMQ' },
];

const DESCRIPTION =
  'Бот easyfts: присылает готовые статформы ЕАЭС для продавцов OZON и уведомления о проблемах.\n\n' +
  'Войти можно через сайт кнопкой «Войти через Telegram» или привязать бота в разделе «Аккаунт».';
const SHORT_DESCRIPTION = 'Статформы ЕАЭС для продавцов OZON — готовые XML и уведомления';

@Injectable()
export class TelegramService implements OnApplicationBootstrap, OnModuleDestroy {
  private readonly logger = new Logger(TelegramService.name);
  // null — токен не задан, бот выключен, отправка молча пропускается
  readonly bot: Bot | null;
  private stopping = false;
  // порядок важен: сначала конкретные команды/колбэки всех модулей, потом общий ответ на любое сообщение
  readonly handlers = new Composer<Context>();
  readonly fallback = new Composer<Context>();

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const token = config.get<string>('TELEGRAM_BOT_TOKEN');
    if (!token) {
      this.logger.warn('TELEGRAM_BOT_TOKEN не задан — бот выключен');
      this.bot = null;
      return;
    }
    // api.telegram.org из РФ доступен не везде — в dev ходим через локальный прокси
    const proxy = config.get<string>('TELEGRAM_PROXY');
    this.bot = new Bot(token, proxy ? { client: { baseFetchConfig: { agent: new HttpsProxyAgent(proxy) } } } : undefined);
    this.bot.catch((err) => this.logger.error(`Update ${err.ctx.update.update_id} failed: ${err.message}`));
    // в группах бот не нужен — только личка
    const pm = this.bot.chatType('private');
    pm.use(this.handlers);
    pm.use(this.fallback);
  }

  get adminChatId(): string | undefined {
    return this.config.get<string>('TELEGRAM_ADMIN_CHAT_ID') || undefined;
  }

  // меню команд и описание — идемпотентно, при каждом старте
  private async configureProfile(bot: Bot) {
    await bot.api.setMyCommands(USER_COMMANDS);
    await bot.api.setMyDescription(DESCRIPTION);
    await bot.api.setMyShortDescription(SHORT_DESCRIPTION);
    if (this.adminChatId) {
      await bot.api.setMyCommands([...USER_COMMANDS, ...ADMIN_COMMANDS], {
        scope: { type: 'chat', chat_id: this.adminChatId },
      });
    }
  }

  // хендлеры регистрируются в onModuleInit других сервисов → запускаем polling позже, на bootstrap
  onApplicationBootstrap() {
    if (this.bot) void this.startPolling(this.bot);
  }

  // срабатывает при app.close() (тесты, ручное закрытие); stop() ждёт текущий long poll — ограничиваем по времени
  async onModuleDestroy() {
    this.stopping = true;
    if (!this.bot?.isRunning()) return;
    await Promise.race([
      this.bot.stop().catch((e) => this.logger.warn(`Bot stop failed: ${(e as Error).message}`)),
      new Promise((r) => setTimeout(r, STOP_TIMEOUT)),
    ]);
  }

  // start() резолвится только при остановке; 409 (старый процесс после рестарта ещё держит getUpdates, до ~30 с) и сеть — перезапуск
  private async startPolling(bot: Bot) {
    while (!this.stopping) {
      try {
        await bot.start({
          onStart: (me) => {
            this.logger.log(`Bot @${me.username} polling`);
            this.configureProfile(bot).catch((e) => this.logger.warn(`Bot profile setup failed: ${(e as Error).message}`));
          },
        });
        return;
      } catch (e) {
        if (this.stopping) return;
        this.logger.error(`Polling stopped: ${(e as Error).message} — restart in ${RESTART_DELAY / 1000}s`);
        await new Promise((r) => setTimeout(r, RESTART_DELAY));
      }
    }
  }

  get username(): string | null {
    return this.bot?.isInited() ? this.bot.botInfo.username : null;
  }

  async sendMessage(chatId: bigint, html: string, buttons?: TelegramButton[]) {
    if (!this.bot) return;
    await this.withBlockedCheck(chatId, () =>
      this.bot!.api.sendMessage(Number(chatId), html, {
        parse_mode: 'HTML',
        link_preview_options: { is_disabled: true },
        reply_markup: keyboard(buttons),
      }),
    );
  }

  async sendDocument(chatId: bigint, filename: string, content: string | Buffer) {
    if (!this.bot) return;
    const data = typeof content === 'string' ? Buffer.from(content, 'utf-8') : content;
    await this.withBlockedCheck(chatId, () => this.bot!.api.sendDocument(Number(chatId), new InputFile(data, filename)));
  }

  // технические ошибки — в чат админа (TELEGRAM_ADMIN_CHAT_ID); не бросает, чтобы не ломать вызывающий поток
  async alertAdmin(html: string) {
    const chatId = this.adminChatId;
    if (!this.bot || !chatId) return;
    await this.bot.api
      .sendMessage(chatId, html, { parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
      .catch((e) => this.logger.error(`Admin alert failed: ${(e as Error).message}`));
  }

  // 403 = юзер заблокировал бота или удалил чат → отвязываем, чтобы не долбить API впустую
  private async withBlockedCheck<T>(chatId: bigint, send: () => Promise<T>): Promise<T | undefined> {
    try {
      return await send();
    } catch (e) {
      if (e instanceof GrammyError && e.error_code === 403) {
        await this.prisma.user.updateMany({
          where: { telegramChatId: chatId },
          data: { telegramChatId: null, telegramUsername: null },
        });
        this.logger.warn(`Chat ${chatId} blocked the bot — unlinked`);
        return undefined;
      }
      throw e;
    }
  }
}
