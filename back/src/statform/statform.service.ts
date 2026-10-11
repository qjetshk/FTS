import {
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { NotificationService } from '../notification/notification.service';
import { PrismaService } from '../prisma/prisma.service';
import { buildStatFormXml } from './statform.builder';
import { CreateStatformDto } from './dto/create-statform.dto';
import { decrypt, encrypt, EncryptedPayload } from 'src/utils/crypto.util';
import { CbrService, CbrUnavailableError } from './cbr.service';
import type { StatformFailCause } from '../notification/notification.events';
import { StatformProducer } from './statform.producer';

// BY + 2026-09 → BY_statform_09-26.xml
export const statformFilename = (country: string, period: string) => {
  const [year, month] = period.split('-');
  return `${country}_statform_${month}-${year.slice(2)}.xml`;
};

@Injectable()
export class StatformService {
  private readonly logger = new Logger(StatformService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cbr: CbrService,
    private readonly producer: StatformProducer,
    private readonly notifications: NotificationService,
  ) {}

  async createStatform(dto: CreateStatformDto) {
    const { organizationId, country, period, orders } = dto;

    // ── 1. Организация ────────────────────────────────────────────────────────
    const org = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });
    if (!org) throw new NotFoundException('Organization not found');

    // ── 2. Декларант + документ ───────────────────────────────────────────────
    const declarant = await this.prisma.declarant.findUnique({
      where: { organizationId },
      include: { document: true },
    });
    if (!declarant) throw new NotFoundException('Declarant not found');
    if (!declarant.document)
      throw new NotFoundException('Declarant document not found');

    // ── 3. tnvedMap из products по sku ────────────────────────────────────────
    const skus = [...new Set(orders.map((o) => Number(o.sku)))];
    const products = await this.prisma.product.findMany({
      where: { sku: { in: skus }, organizationId },
      select: { sku: true, name: true, tnvedCode: true, tnvedName: true, tnvedUnit: true },
    });

    // Без кода ТН ВЭД товар не попадёт в GoodsInfo, а его договор/инвойс попадёт в Documents —
    // форма выйдет неполной. Не собираем её вообще, отдаём n8n список проблемных SKU.
    const withCode = products.filter((p) => p.tnvedCode);
    const missing = skus
      .filter((sku) => !withCode.some((p) => p.sku === sku))
      .map((sku) => ({ sku: String(sku), name: products.find((p) => p.sku === sku)?.name ?? null }));
    if (missing.length) {
      this.logger.warn(`createStatform blocked: org=${organizationId} ${country} ${period}, no tnved for ${missing.length} sku`);
      throw new UnprocessableEntityException({
        message: `Нет кода ТН ВЭД у ${missing.length} товаров из отправок`,
        missing,
      });
    }

    const tnvedMap = Object.fromEntries(
      withCode.map((p) => [p.sku, { code: p.tnvedCode!, name: p.tnvedName!, unit: p.tnvedUnit ?? null }]),
    );

    // ── 4. Курс USD с ЦБ РФ на первое число отчётного месяца ─────────────────
    const [year, month] = period.split('-');
    const cbrDate = `01.${month}.${year}`;
    let usdRate: number;
    try {
      usdRate = await this.cbr.getUsdRate(cbrDate);
    } catch (e) {
      if (!(e instanceof CbrUnavailableError)) throw e;
      // ни ЦБ, ни зеркало не ответили — останавливаем прогон, юзер получит письмо «подождите и запустите заново»
      await this.failRun(organizationId, period, e.message, 'rate_unavailable');
      throw new ServiceUnavailableException(e.message);
    }

    // ── 5. Генерация XML ──────────────────────────────────────────────────────
    const xml = await buildStatFormXml({
      org,
      declarant,
      doc: declarant.document,
      countryCode: country,
      period,
      usdRate,
      orders,
      tnvedMap,
      signingDate: new Date().toISOString().slice(0, 19),
    });

    // ── 6. Шифрование ─────────────────────────────────────────────────────────
    const key = Buffer.from(process.env.XML_ENCRYPTION_KEY!, 'hex');
    const encryptedXml = encrypt(xml, key);

    // ── 7. Найти или создать StatFormRun для (organizationId, period) ─────────
    const run = await this.prisma.statFormRun.upsert({
      where: { organizationId_period: { organizationId, period } },
      create: { organizationId, period },
      update: {},
    });

    // ── 8. Upsert StatForm по (runId, country) ────────────────────────────────
    const statform = await this.prisma.statForm.upsert({
      where: { runId_country: { runId: run.id, country } },
      create: {
        runId: run.id,
        country,
        status: 'READY',
        encryptedXml,
        itemsCount: orders.length,
        completedAt: new Date(),
      },
      update: {
        status: 'READY',
        encryptedXml,
        itemsCount: orders.length,
        completedAt: new Date(),
      },
    });

    return { id: statform.id, runId: run.id, country, period };
  }

  // ── Скачать расшифрованный XML ────────────────────────────────────────────
  // organizationId не передаётся только из внутреннего эндпоинта (email-worker), там доступ проверяет ApiKeyGuard
  async getStatformFile(id: string, organizationId?: string): Promise<{ filename: string; content: string }> {
    const statform = await this.prisma.statForm.findFirst({
      where: { id, ...(organizationId && { run: { organizationId } }), status: 'READY' },
      select: { country: true, encryptedXml: true, run: { select: { period: true } } },
    });
    if (!statform?.encryptedXml) throw new NotFoundException('Statform not found');

    const key = Buffer.from(process.env.XML_ENCRYPTION_KEY!, 'hex');
    return {
      filename: statformFilename(statform.country, statform.run.period),
      content: decrypt(statform.encryptedXml as unknown as EncryptedPayload, key),
    };
  }

  // ── Список ранов организации со статформами ───────────────────────────────
  async getStatforms(organizationId: string) {
    return this.prisma.statFormRun.findMany({
      where: { organizationId },
      include: {
        statForms: {
          select: {
            id: true,
            country: true,
            status: true,
            itemsCount: true,
            completedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Получить organizationId по userId ─────────────────────────────────────
  async getOrgByUserId(userId: string) {
    const org = await this.prisma.organization.findFirst({
      where: { userId },
    });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  // ── Поставить задачу генерации в очередь (ручной запуск) ─────────────────
  async runStatform(org: { id: string; ozonClientId: number; ozonApiKey: string }, period: string) {
    await this.producer.enqueue({
      organizationId: org.id,
      ozonClientId: org.ozonClientId,
      ozonApiKey: org.ozonApiKey,
      period,
      triggeredBy: 'manual',
    });

    return { queued: true, period };
  }

  // ── Коллбэки от n8n — обновить статус рана ───────────────────────────────
  async completeRun(organizationId: string, period: string) {
    this.logger.log(`completeRun: org=${organizationId} period=${period}`);
    const run = await this.prisma.statFormRun.findUnique({
      where: { organizationId_period: { organizationId, period } },
      include: { statForms: { select: { id: true, status: true, country: true } } },
    });
    // прогон уже провален в этом запуске (например, нет курса ЦБ) — не перетираем FAILED на READY;
    // при новом запуске процессор сам переводит его в BUILDING
    if (!run || run.status === 'FAILED' || run.statForms.length === 0) return;

    const hasFailed = run.statForms.some((f) => f.status === 'FAILED');
    const allReady = run.statForms.every((f) => f.status === 'READY');
    const status = allReady ? 'READY' : hasFailed ? 'PARTIAL' : 'READY';

    await this.prisma.statFormRun.update({
      where: { id: run.id },
      data: { status, completedAt: new Date() },
    });

    const ready = run.statForms.filter((f) => f.status === 'READY');
    if (ready.length === 0) return;

    // уведомление не должно ломать колбэк n8n; XML воркер подтянет сам по statformIds (в очередь ПДн не кладём)
    this.notifications
      .notify(
        organizationId,
        'statform.ready',
        {
          period,
          countries: ready.map((f) => f.country),
          statformIds: ready.map((f) => f.id),
          partial: status === 'PARTIAL',
        },
        run.id,
      )
      .catch((e) => this.logger.error(`statform.ready notify failed: ${e.message}`));
  }

  async failRun(organizationId: string, period: string, reason?: string, cause?: StatformFailCause) {
    const run = await this.prisma.statFormRun.upsert({
      where: { organizationId_period: { organizationId, period } },
      create: { organizationId, period, status: 'FAILED', failureReason: reason ?? null },
      update: { status: 'FAILED', failureReason: reason ?? null },
    });

    this.notifications
      .notify(organizationId, 'statform.failed', { period, ...(cause && { cause }) }, run.id)
      .catch((e) => this.logger.error(`statform.failed notify failed: ${e.message}`));
  }
}
