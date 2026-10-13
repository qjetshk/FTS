import { GoneException, HttpException, HttpStatus, Injectable, OnModuleInit, ServiceUnavailableException } from '@nestjs/common';
import { randomBytes } from 'crypto';
import { InlineKeyboard, type Context } from 'grammy';
import type { Response } from 'express';
import { RedisService } from 'src/redis/redis.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { escapeHtml } from 'src/telegram/telegram.format';
import { AuthService, type TelegramIdentity } from './auth.service';

const LOGIN_TTL = 5 * 60;
const LOGIN_PREFIX = 'login_';
const IP_WINDOW = 60 * 60;
const IP_LIMIT = 30; // попыток входа через Telegram с одного IP в час
const loginKey = (token: string) => `tg-login:${token}`;

type LoginRecord =
  | { status: 'pending'; device: string; ip?: string }
  | { status: 'cancelled' }
  | { status: 'confirmed'; chatId: string; username: string | null; name: string };

// Вход через бота, без домена и Login Widget (работает и на localhost):
// сайт берёт токен → открывает t.me/<bot>?start=login_<token> → юзер жмёт «Войти» в боте → сайт опрашивает poll и получает сессию.
// Токен знает только браузер, начавший вход; подтверждение в боте показывает устройство и IP — защита от подсунутой ссылки.
@Injectable()
export class TelegramLoginService implements OnModuleInit {
  constructor(
    private telegram: TelegramService,
    private redis: RedisService,
    private auth: AuthService,
  ) {}

  onModuleInit() {
    const { handlers } = this.telegram;
    handlers.command('start').filter(
      (ctx) => typeof ctx.match === 'string' && ctx.match.startsWith(LOGIN_PREFIX),
      (ctx) => this.onLoginStart(ctx, String(ctx.match).slice(LOGIN_PREFIX.length)),
    );
    handlers.callbackQuery(/^tgl:(ok|no):([\w-]+)$/, (ctx) => this.onDecision(ctx, ctx.match[1] === 'ok', ctx.match[2]));
  }

  async start(userAgent?: string, ip?: string) {
    const username = this.telegram.username;
    if (!username) throw new ServiceUnavailableException('Вход через Telegram сейчас недоступен, войдите по почте');
    if (ip && (await this.redis.incrWindow(`tg-login:ip:${ip}`, IP_WINDOW)) > IP_LIMIT) {
      throw new HttpException('Слишком много попыток входа, попробуйте позже', HttpStatus.TOO_MANY_REQUESTS);
    }

    const token = randomBytes(24).toString('base64url');
    const record: LoginRecord = { status: 'pending', device: this.auth.parseDevice(userAgent), ip };
    await this.redis.set(loginKey(token), JSON.stringify(record), LOGIN_TTL);
    return { token, url: `https://t.me/${username}?start=${LOGIN_PREFIX}${token}`, expiresIn: LOGIN_TTL };
  }

  async poll(token: string, res: Response, userAgent?: string, ip?: string) {
    const raw = await this.redis.get(loginKey(token));
    if (!raw) throw new GoneException('Время на вход истекло — начните заново');
    const record = JSON.parse(raw) as LoginRecord;
    if (record.status === 'pending') return { status: 'pending' as const };

    // подтверждён или отменён — токен одноразовый; getDel не даст двум параллельным poll выдать две сессии
    if (!(await this.redis.getDel(loginKey(token)))) throw new GoneException('Время на вход истекло — начните заново');
    if (record.status === 'cancelled') return { status: 'cancelled' as const };

    const identity: TelegramIdentity = { chatId: BigInt(record.chatId), username: record.username, name: record.name };
    const session = await this.auth.loginWithTelegram(identity, res, userAgent, ip);
    return { status: 'ok' as const, ...session };
  }

  private async onLoginStart(ctx: Context, token: string) {
    const raw = await this.redis.get(loginKey(token));
    const record = raw ? (JSON.parse(raw) as LoginRecord) : null;
    if (record?.status !== 'pending') {
      await ctx.reply('Ссылка для входа устарела — нажмите «Войти через Telegram» на сайте ещё раз.');
      return;
    }
    const ip = record.ip ? `\nIP: ${escapeHtml(record.ip)}` : '';
    await ctx.reply(
      `<b>Вход в easyfts</b>\nУстройство: ${escapeHtml(record.device)}${ip}\n\nЕсли вход начинали не вы — нажмите «Отмена».`,
      {
        parse_mode: 'HTML',
        reply_markup: new InlineKeyboard().text('✅ Войти', `tgl:ok:${token}`).text('Отмена', `tgl:no:${token}`),
      },
    );
  }

  private async onDecision(ctx: Context, approve: boolean, token: string) {
    const raw = await this.redis.get(loginKey(token));
    const record = raw ? (JSON.parse(raw) as LoginRecord) : null;
    if (record?.status !== 'pending') {
      await ctx.answerCallbackQuery({ text: 'Ссылка для входа устарела' });
      await ctx.editMessageText('Ссылка для входа устарела — начните вход на сайте заново.');
      return;
    }

    const from = ctx.from!;
    const next: LoginRecord = approve
      ? {
          status: 'confirmed',
          chatId: String(ctx.chat!.id),
          username: from.username ?? null,
          name: [from.first_name, from.last_name].filter(Boolean).join(' '),
        }
      : { status: 'cancelled' };
    await this.redis.setKeepTtl(loginKey(token), JSON.stringify(next));

    await ctx.answerCallbackQuery();
    await ctx.editMessageText(
      approve ? '✅ Вход подтверждён — вернитесь в браузер.' : 'Вход отменён. Если это были не вы — просто проигнорируйте.',
    );
  }
}
