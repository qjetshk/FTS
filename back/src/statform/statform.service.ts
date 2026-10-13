import {
  ConflictException,
  HttpException,
  HttpStatus,
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
import { encrypt } from 'src/utils/crypto.util';
import { CbrService, CbrUnavailableError } from './cbr.service';
import type { ReviewProductItem, StatformFailCause } from '../notification/notification.events';
import type { FailedCountryItem } from './dto/run-callback.dto';
import { RunEventsService, RUN_VIEW } from './run-events.service';
import { RedisService } from 'src/redis/redis.service';
import type { RUN_STAGE } from '@prisma/client';
import { StatformProducer } from './statform.producer';

export const STALE_RUN_MS = 30 * 60 * 1000;
const MANUAL_RUNS_LIMIT = 2;
const MANUAL_RUNS_WINDOW = 60 * 60;

// '2026-09' → 'сентябрь 2026'
const formatPeriodRu = (period: string) => {
  const [year, month] = period.split('-').map(Number);
  return `${new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(year, month - 1, 1))} ${year}`;
};

@Injectable()
export class StatformService {
  private readonly logger = new Logger(StatformService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly cbr: CbrService,
    private readonly producer: StatformProducer,
    private readonly notifications: NotificationService,
    private readonly runEvents: RunEventsService,
    private readonly redis: RedisService,
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
      create: { organizationId, period, status: 'BUILDING', stage: 'FILLING' },
      update: { stage: 'FILLING' },
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

    await this.runEvents.emit(run.id);
    return { id: statform.id, runId: run.id, country, period };
  }

  // ── Список ранов организации со статформами ───────────────────────────────
  async getStatforms(organizationId: string) {
    return this.prisma.statFormRun.findMany({
      where: { organizationId },
      include: RUN_VIEW,
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
  // Защита от спама кнопкой/API: одна активная генерация на период + лимит запусков в час на организацию
  async runStatform(org: { id: string; ozonClientId: number; ozonApiKey: string }, period: string) {
    const label = formatPeriodRu(period);

    // мьютекс на проверку+блокировку: два одновременных запроса не проскочат оба
    const lockKey = `statform:run-lock:${org.id}:${period}`;
    if (!(await this.redis.setIfAbsent(lockKey, '1', 10))) {
      throw new ConflictException(`Генерация за ${label} уже запускается`);
    }

    try {
      const current = await this.prisma.statFormRun.findUnique({
        where: { organizationId_period: { organizationId: org.id, period } },
        select: { status: true, updatedAt: true },
      });
      const active = current && (current.status === 'PENDING' || current.status === 'BUILDING');
      // прогон без изменений дольше STALE_RUN_MS считаем зависшим (n8n упал молча) — его можно перезапустить
      if (active && Date.now() - current.updatedAt.getTime() < STALE_RUN_MS) {
        throw new ConflictException(`Генерация за ${label} уже идёт — дождитесь завершения`);
      }

      const limitKey = `statform:manual-runs:${org.id}`;
      if ((await this.redis.incrWindow(limitKey, MANUAL_RUNS_WINDOW)) > MANUAL_RUNS_LIMIT) {
        const retryAfter = await this.redis.ttl(limitKey);
        throw new HttpException(
          {
            message: `Слишком много запусков генерации. Попробуйте через ${Math.ceil(retryAfter / 60)} мин.`,
            retryAfter,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // сразу помечаем прогон «в очереди» — дальше кнопка заблокирована, юзер видит статус
      const run = await this.prisma.statFormRun.upsert({
        where: { organizationId_period: { organizationId: org.id, period } },
        create: { organizationId: org.id, period, status: 'PENDING' },
        update: { status: 'PENDING', stage: null, failureReason: null },
      });
      await this.runEvents.emit(run.id);
    } finally {
      await this.redis.del(lockKey);
    }

    await this.producer.enqueue({
      organizationId: org.id,
      ozonClientId: org.ozonClientId,
      ozonApiKey: org.ozonApiKey,
      period,
      triggeredBy: 'manual',
    });

    return { queued: true, period };
  }

  // ── Коллбэки от n8n — шаги и итог прогона ────────────────────────────────

  // n8n знает client_id из вебхука, внутренние вызовы — organizationId
  async resolveOrgId(ref: { organizationId?: string; clientId?: number }): Promise<string> {
    if (ref.organizationId) return ref.organizationId;
    const org = await this.prisma.organization.findUnique({
      where: { ozonClientId: ref.clientId },
      select: { id: true },
    });
    if (!org) throw new NotFoundException(`Организация с clientId ${ref.clientId} не найдена`);
    return org.id;
  }

  // промежуточный шаг; на завершённый прогон не действует (поздний колбэк не «оживит» его)
  async setStage(organizationId: string, period: string, stage: RUN_STAGE) {
    const run = await this.prisma.statFormRun.findUnique({
      where: { organizationId_period: { organizationId, period } },
      select: { id: true, status: true },
    });
    if (!run || run.status !== 'BUILDING') return;

    await this.prisma.statFormRun.update({ where: { id: run.id }, data: { stage } });
    await this.runEvents.emit(run.id);
  }

  // прогоны без изменений дольше STALE_RUN_MS: n8n упал посреди выполнения (Error Workflow на это не срабатывает)
  // или задача потерялась в очереди — без этого юзер видит вечную «генерацию» и не получает письма
  async failStaleRuns(): Promise<number> {
    const stale = await this.prisma.statFormRun.findMany({
      where: {
        status: { in: ['PENDING', 'BUILDING'] },
        updatedAt: { lt: new Date(Date.now() - STALE_RUN_MS) },
      },
      select: { organizationId: true, period: true },
    });
    for (const { organizationId, period } of stale) {
      this.logger.warn(`Stale run: org=${organizationId} period=${period}`);
      await this.failRun(
        organizationId,
        period,
        'Генерация прервалась — сервис формирования не ответил. Запустите генерацию заново.',
      ).catch((e: Error) => this.logger.error(`failStaleRuns: ${e.message}`));
    }
    return stale.length;
  }

  // итоговый колбэк n8n — один на прогон, после Create XML по всем странам.
  // failedCountries — страны, где create-n8n упал (собравшиеся уже лежат в READY)
  async completeRun(organizationId: string, period: string, failedCountries: FailedCountryItem[] = []) {
    this.logger.log(
      `completeRun: org=${organizationId} period=${period} failed=${failedCountries.map((f) => f.country).join(',') || '-'}`,
    );
    const found = await this.prisma.statFormRun.findUnique({
      where: { organizationId_period: { organizationId, period } },
      select: { id: true, status: true },
    });
    // прогон уже завершился ошибкой в этом запуске (нет курса ЦБ, товары на проверку) — не перетираем;
    // при новом запуске процессор сам переводит его в BUILDING
    if (!found || found.status !== 'BUILDING') return;

    // XML старой версии остаётся в записи, но скачать его нельзя — файл отдаётся только для READY
    for (const { country } of failedCountries) {
      await this.prisma.statForm.upsert({
        where: { runId_country: { runId: found.id, country } },
        create: { runId: found.id, country, status: 'FAILED' },
        update: { status: 'FAILED', completedAt: null },
      });
    }

    const run = await this.prisma.statFormRun.findUniqueOrThrow({
      where: { id: found.id },
      include: { statForms: { select: { id: true, status: true, country: true } } },
    });
    if (run.statForms.length === 0) return;

    // ни одна страна не собралась — это ошибка прогона, а не частичный результат
    if (!run.statForms.some((f) => f.status === 'READY')) {
      const reason = failedCountries.map((f) => `${f.country}: ${f.reason ?? 'ошибка формирования XML'}`).join('; ');
      return this.failRun(organizationId, period, reason.slice(0, 500) || undefined);
    }

    const hasFailed = run.statForms.some((f) => f.status === 'FAILED');
    const status = hasFailed ? 'PARTIAL' : 'READY';

    await this.prisma.statFormRun.update({
      where: { id: run.id },
      data: { status, stage: null, completedAt: new Date() },
    });
    await this.runEvents.emit(run.id);

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

  // reason — человекочитаемая причина на русском: видна юзеру на странице и в письме
  async failRun(organizationId: string, period: string, reason?: string, cause?: StatformFailCause) {
    // завершённый прогон не трогаем: поздняя ошибка (Error Workflow n8n, повторный колбэк) не должна
    // перетереть готовый результат или прислать второе письмо. Новый запуск сам переводит прогон в PENDING
    const existing = await this.prisma.statFormRun.findUnique({
      where: { organizationId_period: { organizationId, period } },
      select: { status: true },
    });
    if (existing && existing.status !== 'PENDING' && existing.status !== 'BUILDING') {
      this.logger.warn(`failRun skipped: org=${organizationId} period=${period} already ${existing.status}`);
      return;
    }

    const run = await this.prisma.statFormRun.upsert({
      where: { organizationId_period: { organizationId, period } },
      create: { organizationId, period, status: 'FAILED', failureReason: reason ?? null },
      update: { status: 'FAILED', stage: null, failureReason: reason ?? null },
    });
    await this.runEvents.emit(run.id);

    this.notifications
      .notify(organizationId, 'statform.failed', { period, ...(cause && { cause }), ...(reason && { reason }) }, run.id)
      .catch((e) => this.logger.error(`statform.failed notify failed: ${e.message}`));
  }

  // генерация остановлена: у товаров из отправок нет кода ТН ВЭД или он требует проверки
  async needsReviewRun(organizationId: string, period: string, products: ReviewProductItem[]) {
    const run = await this.prisma.statFormRun.upsert({
      where: { organizationId_period: { organizationId, period } },
      create: { organizationId, period, status: 'NEEDS_REVIEW' },
      update: {
        status: 'NEEDS_REVIEW',
        stage: null,
        failureReason: `Проверьте коды ТН ВЭД у ${products.length} товаров из отправок и запустите генерацию заново`,
      },
    });
    await this.runEvents.emit(run.id);

    this.notifications
      .notify(organizationId, 'products.need-review', { period, products }, run.id)
      .catch((e) => this.logger.error(`products.need-review notify failed: ${e.message}`));
  }
}
