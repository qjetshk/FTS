import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildStatFormXml } from './statform.builder';
import { CreateStatformDto } from './dto/create-statform.dto';
import { decrypt, encrypt, EncryptedPayload } from 'src/utils/crypto.util';
import { CbrService } from './cbr.service';
import { StatformProducer } from './statform.producer';

@Injectable()
export class StatformService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cbr: CbrService,
    private readonly producer: StatformProducer,
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
      where: {
        sku: { in: skus },
        organizationId,
        tnvedCode: { not: null },
      },
      select: { sku: true, tnvedCode: true, tnvedName: true },
    });

    const tnvedMap = Object.fromEntries(
      products.map((p) => [p.sku, { code: p.tnvedCode!, name: p.tnvedName! }]),
    );

    // ── 4. Курс USD с ЦБ РФ на первое число отчётного месяца ─────────────────
    const [year, month] = period.split('-');
    const cbrDate = `01.${month}.${year}`;
    const usdRate = await this.cbr.getUsdRate(cbrDate);

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
  async getStatformXml(id: string, organizationId: string): Promise<string> {
    const statform = await this.prisma.statForm.findFirst({
      where: { id, run: { organizationId } },
    });
    if (!statform) throw new NotFoundException('Statform not found');

    const key = Buffer.from(process.env.XML_ENCRYPTION_KEY!, 'hex');
    return decrypt(statform.encryptedXml as unknown as EncryptedPayload, key);
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
    console.log(`[completeRun] called: org=${organizationId} period=${period}`);
    const run = await this.prisma.statFormRun.findUnique({
      where: { organizationId_period: { organizationId, period } },
      include: { statForms: { select: { status: true } } },
    });
    if (!run) return;

    const hasFailed = run.statForms.some((f) => f.status === 'FAILED');
    const allReady = run.statForms.every((f) => f.status === 'READY');
    const status = allReady ? 'READY' : hasFailed ? 'PARTIAL' : 'READY';

    await this.prisma.statFormRun.update({
      where: { id: run.id },
      data: { status, completedAt: new Date() },
    });
  }

  async failRun(organizationId: string, period: string, reason?: string) {
    await this.prisma.statFormRun.update({
      where: { organizationId_period: { organizationId, period } },
      data: { status: 'FAILED', failureReason: reason ?? null },
    });
  }
}
