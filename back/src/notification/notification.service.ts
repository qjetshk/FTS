import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'crypto';
import { plainToInstance, type ClassConstructor } from 'class-transformer';
import { validate, type ValidationError } from 'class-validator';
import { PrismaService } from 'src/prisma/prisma.service';
import { EmailProducerService, type EnqueueResult } from 'src/email-producer/email-producer.service';
import { SendNotificationDto } from './dto/send-notification.dto';
import {
  NOTIFICATION_ACTION_PATH,
  NOTIFICATION_PAYLOADS,
  type NotificationEvent,
  type NotificationPayload,
} from './notification.events';

const DEDUP_TTL = 24 * 60 * 60 * 1000; // повтор того же события в течение суток отбрасывается

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
      select: { fullOrg: true, user: { select: { email: true, name: true } } },
    });
    if (!org) {
      this.logger.warn(`Skip ${event}: organization ${organizationId} not found`);
      return { deduplicated: false };
    }

    const frontendUrl = this.config.get<string>('FRONTEND_URL', 'http://localhost:3000');
    return this.emailProducer.sendNotification(
      event,
      {
        to: org.user.email,
        name: org.user.name,
        orgName: org.fullOrg,
        actionUrl: `${frontendUrl}${NOTIFICATION_ACTION_PATH[event]}`,
        ...payload,
      },
      // дубль = то же событие + тот же ключ + то же содержимое (другие товары за тот же период → новое письмо)
      dedupKey ? { id: `${event}_${dedupKey}_${contentHash(payload)}`, ttl: DEDUP_TTL } : undefined,
    );
  }
}
