import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailProducerService, type EnqueueResult } from 'src/email-producer/email-producer.service';
import { TelegramService } from 'src/telegram/telegram.service';
import { StatformFileService } from 'src/statform/statform-file.service';
import { RedisService } from 'src/redis/redis.service';
import { escapeHtml } from 'src/telegram/telegram.format';
import { TELEGRAM_MESSAGES, type TelegramMessage } from './telegram.messages';
import { SendNotificationDto } from './dto/send-notification.dto';
import {
  NOTIFICATION_ACTION_PATH,
  NOTIFICATION_PAYLOADS,
  type NotificationEvent,
  type NotificationPayload,
} from './notification.events';

const DEDUP_TTL = 24 * 60 * 60 * 1000; // повтор того же события в течение суток отбрасывается
// сбои, о которых админ узнаёт сразу (в TELEGRAM_ADMIN_CHAT_ID), не дожидаясь жалобы юзера
const ADMIN_ALERT_EVENTS: NotificationEvent[] = ['statform.failed', 'ozon.api-error'];

// Хэш, не зависящий от порядка ключей и элементов массивов: тот же набор товаров в другом порядке — тот же хэш
function contentHash(value: unknown): string {
  const normalize = (v: unknown): unknown => {
    if (Array.isArray(v)) return v.map(normalize).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
    if (v && typeof v === 'object') {
      return Object.fromEntries(Object.keys(v).sort().map((k) => [k, normalize((v as Record<string, unknown>)[k])]));
    }
    return v;
  };
  return createHash('sha1').update(JSON.stringify(normalize(value))).digest('hex').slice(0, 12);
}

// 'payload.products.0.name: name must be a string' — ошибки вложенных объектов лежат в children
function flattenErrors(errors: ValidationError[], path: string): string[] {
  return errors.flatMap((e) => {
    const field = `${path}.${e.property}`;
    const own = Object.values(e.constraints ?? {}).map((msg) => `${field}: ${msg}`);
    return [...own, ...flattenErrors(e.children ?? [], field)];
  });
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private emailProducer: EmailProducerService,
    private telegram: TelegramService,
    private statformFile: StatformFileService,
    private redis: RedisService,
  ) {}

  // Из n8n: payload приходит сырым → валидируем по классу конкретного события
  async notifyExternal(dto: SendNotificationDto) {
    const cls: ClassConstructor<object> = NOTIFICATION_PAYLOADS[dto.event];
    const payload = plainToInstance(cls, dto.payload);
    const errors = await validate(payload, { whitelist: true, forbidNonWhitelisted: true });
    if (errors.length) throw new BadRequestException(flattenErrors(errors, 'payload'));

    const org = await this.prisma.organization.findUnique({
      where: { ozonClientId: dto.clientId },
      select: { id: true },
    });
    if (!org) throw new NotFoundException(`Организация с clientId ${dto.clientId} не найдена`);

    const result = await this.notify(org.id, dto.event, payload as NotificationPayload<typeof dto.event>, dto.idempotencyKey);
    // deduplicated: true — такое событие уже отправлялось за последние сутки, новое письмо не создано
    return { queued: !result.deduplicated, ...result };
  }

  // Изнутри бэка: payload уже типизирован. Получатель — владелец организации.
  async notify<E extends NotificationEvent>(
    organizationId: string,
    event: E,
    payload: NotificationPayload<E>,
    dedupKey?: string,
  ): Promise<EnqueueResult> {
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
      select: {
        fullOrg: true,
        ozonClientId: true,
        user: { select: { email: true, name: true, telegramChatId: true } },
      },
    });
    if (!org) {
      this.logger.warn(`Skip ${event}: organization ${organizationId} not found`);
      return { deduplicated: false };
    }

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const path = NOTIFICATION_ACTION_PATH[event] as string | ((p: NotificationPayload<E>) => string);
    const actionPath = typeof path === 'function' ? path(payload) : path;
    const actionUrl = `${frontendUrl}${actionPath}`;

    // дубль = то же событие + тот же ключ + то же содержимое (другие товары за тот же период → новое уведомление)
    // дедуп в Redis, а не только в BullMQ: у вошедших через Telegram почты может не быть
    const dedupId = dedupKey ? `${event}_${dedupKey}_${contentHash(payload)}` : undefined;
    if (dedupId && !(await this.redis.setIfAbsent(`notify:${dedupId}`, '1', DEDUP_TTL / 1000))) {
      this.logger.log(`Deduplicated ${event} for org ${organizationId}: ${dedupId}`);
      return { deduplicated: true };
    }

    const { email, name, telegramChatId: chatId } = org.user;
    const result: EnqueueResult = email
      ? await this.emailProducer.sendNotification(
          event,
          { to: email, name, orgName: org.fullOrg, actionUrl, ...payload },
          dedupId ? { id: dedupId, ttl: DEDUP_TTL } : undefined,
        )
      : { deduplicated: false };

    // Telegram — доп. канал (или единственный у юзера без почты); ошибки не ломают основной поток
    if (chatId) {
      this.sendTelegram(chatId, event, payload, { orgName: org.fullOrg, actionUrl }).catch((e) =>
        this.logger.error(`Telegram ${event} to chat ${chatId} failed: ${(e as Error).message}`),
      );
    }
    if (ADMIN_ALERT_EVENTS.includes(event)) {
      const reason = 'reason' in payload && payload.reason ? `\n${escapeHtml(String(payload.reason))}` : '';
      const cause = 'cause' in payload && payload.cause ? ` · ${payload.cause}` : '';
      void this.telegram.alertAdmin(
        `🚨 <b>${event}</b>${cause}\n${escapeHtml(org.fullOrg)} (client ${org.ozonClientId})${reason}`,
      );
    }
    return result;
  }

  private async sendTelegram<E extends NotificationEvent>(
    chatId: bigint,
    event: E,
    payload: NotificationPayload<E>,
    ctx: { orgName: string; actionUrl: string },
  ) {
    const render = TELEGRAM_MESSAGES[event] as (p: NotificationPayload<E>, c: typeof ctx) => TelegramMessage;
    const { html, buttons } = render(payload, ctx);
    await this.telegram.sendMessage(chatId, html, buttons);

    // готовые XML — следом отдельными файлами, как вложения в письме
    if (event === 'statform.ready') {
      for (const id of (payload as NotificationPayload<'statform.ready'>).statformIds) {
        const { filename, content } = await this.statformFile.getStatformFile(id);
        await this.telegram.sendDocument(chatId, filename, content);
      }
    }
  }
}
