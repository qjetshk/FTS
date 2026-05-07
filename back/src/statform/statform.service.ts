import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { buildStatFormXml } from './statform.builder';
import { CreateStatformDto } from './dto/create-statform.dto';
import { decrypt, encrypt, EncryptedPayload } from 'src/utils/crypto.util';
import { CbrService } from './cbr.service';

@Injectable()
export class StatformService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cbr: CbrService,
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
      // сервис
      products.map((p) => [p.sku, { code: p.tnvedCode!, name: p.tnvedName! }]),
    );

    // ── 4. Курс USD с ЦБ РФ на первое число отчётного месяца ─────────────────
    const [year, month] = period.split('-');
    const cbrDate = `01.${month}.${year}`; // DD.MM.YYYY
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

    // ── 7. Сохранение (upsert — перегенерация за тот же период перезапишет) ──
    const statform = await this.prisma.statForm.upsert({
      where: {
        orgId_country_period: { orgId: organizationId, country, period },
      },
      update: { encryptedXml },
      create: { orgId: organizationId, country, period, encryptedXml },
    });

    return { id: statform.id, country, period };
  }

  // ── Получить расшифрованный XML для скачивания ────────────────────────────
  async getStatformXml(id: string, organizationId: string): Promise<string> {
    const statform = await this.prisma.statForm.findFirst({
      where: { id, orgId: organizationId },
    });
    if (!statform) throw new NotFoundException('Statform not found');

    const key = Buffer.from(process.env.XML_ENCRYPTION_KEY!, 'hex');
    return decrypt(statform.encryptedXml as unknown as EncryptedPayload, key);
  }

  // ── Список статформ организации ───────────────────────────────────────────
  async getStatforms(organizationId: string) {
    return this.prisma.statForm.findMany({
      where: { orgId: organizationId },
      select: { id: true, country: true, period: true, createdAt: true },
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
}
