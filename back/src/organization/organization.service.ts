import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateDeclarantDto } from './dto/update-declarant.dto';
import { CreateDocumentDto } from './dto/create-document.dto';
import { RedisService } from 'src/redis/redis.service';
import { checkOzonKey } from './ozon-key';
import { decryptDocument, decryptField, encryptDocument, encryptField, maskSecret } from 'src/utils/field-crypto.util';

// прогон classify_TNVED идёт часы; RUNNING старше этого считаем зависшим и не блокирующим новый запуск
const SYNC_STALE_MS = 4 * 60 * 60 * 1000;
// проверка ключа дёргает OZON на каждый ввод — ограничиваем, чтобы не словить их бан за спам
const KEY_CHECK_LIMIT = 30;
const KEY_CHECK_WINDOW = 60;

// что юзер может менять из кабинета — остальное (userId, clientId, ИНН…) только через n8n/создание
const ORG_EDITABLE = ['ozonApiKey', 'fullAddress', 'country', 'region', 'city', 'street', 'house', 'room', 'postalCode'] as const;
const DECLARANT_EDITABLE = ['name', 'surname', 'patronymic', 'position', 'email', 'phone'] as const;

// ValidationPipe без whitelist пропускает лишние поля тела — берём только разрешённые и непустые
function pick<T extends object>(dto: T, keys: readonly string[]): Record<string, unknown> {
  return Object.fromEntries(
    keys
      .map((k) => [k, (dto as Record<string, unknown>)[k]] as const)
      .filter(([, v]) => v !== null && v !== undefined),
  );
}

const DECLARANT_SELECT = {
  select: {
    id: true,
    name: true,
    surname: true,
    patronymic: true,
    position: true,
    email: true,
    phone: true,
    document: true,
  },
} as const;

// ответ фронту: ключ OZON — маской, документ декларанта — расшифрованным (его владелец сам и заполнял)
type DocumentRow = { series: string | null; number: string; issuedBy: string };
function toClient<T extends { ozonApiKey: string; declarant?: { document: DocumentRow | null } | null }>(org: T): T {
  return {
    ...org,
    ozonApiKey: maskSecret(org.ozonApiKey),
    declarant: org.declarant && { ...org.declarant, document: decryptDocument(org.declarant.document) },
  };
}

@Injectable()
export class OrganizationService {
  private readonly logger = new Logger(OrganizationService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    private redis: RedisService,
  ) {}

  private n8nToken(): string {
    return this.jwt.sign(
      { service: 'fts-back' },
      // свой секрет: раньше подписывали JWT_ACCESS_SECRET — n8n, зная его, мог выпустить токен любого юзера
      { secret: this.config.getOrThrow<string>('N8N_WEBHOOK_SECRET'), expiresIn: '1m' },
    );
  }

  async createOrganization(dto: CreateOrganizationDto) {
    const exists = await this.prisma.organization.findUnique({
      where: {
        inn: dto.inn,
      },
    });

    if (exists) {
      throw new ConflictException('Такая организация уже существует!');
    }

    await this.prisma.organization.create({
      data: {
        city: dto.city,
        country: dto.country,
        fullOpf: dto.full_opf,
        fullOrg: dto.full_org,
        inn: dto.inn,
        ogrn: dto.ogrn,
        okato5: dto.okato5,
        ozonApiKey: encryptField(dto.api_key),
        ozonClientId: Number(dto.client_id),
        postalCode: dto.postal_code,
        region: dto.region,
        kpp: dto.kpp,
        declarant: {
          create: {
            name: dto.declarant.name,
            surname: dto.declarant.surname,
            patronymic: dto.declarant.patronymic,
          },
        },
        house: dto.house,
        street: dto.street,
        room: dto.room,
        orgLang: dto.org_lang,
        userId: dto.user_id,
      },
    });

    return { message: 'Организация успешно создана!' };
  }

  async getAllOrganizations(userId: string) {
    return this.prisma.organization.findMany({
      where: { userId },
      select: { id: true, fullOrg: true, inn: true, ogrn: true, fullOpf: true },
      orderBy: { createdAt: 'asc' },
    });
  }

  async getOrganizationById(id: string, userId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { id, userId },
      include: {
        declarant: {
          select: {
            id: true,
            name: true,
            surname: true,
            patronymic: true,
            position: true,
            email: true,
            phone: true,
            document: true,
          },
        },
      },
    });

    if (!organization) throw new NotFoundException('Организация не найдена');
    return toClient(organization);
  }

  async getFirstOrganization(userId: string) {
    // тот же порядок, что в get-all: «первая» на странице и в бредкрамбе должна совпадать
    const organization = await this.prisma.organization.findFirst({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        declarant: {
          select: {
            id: true,
            name: true,
            surname: true,
            patronymic: true,
            position: true,
            email: true,
            phone: true,
            document: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Организация не найдена');
    }

    return toClient(organization);
  }

  async getOrganizationId(id: string, clientId: string) {
    // без обоих параметров Prisma проигнорировала бы undefined и вернула первую попавшуюся оргу
    const where = id ? { id } : /^\d+$/.test(clientId ?? '') ? { ozonClientId: Number(clientId) } : null;
    if (!where) throw new NotFoundException('Организация не найдена');
    const organization = await this.prisma.organization.findFirst({ where, select: { id: true } });
    if (!organization) throw new NotFoundException('Организация не найдена');
    return organization;
  }

  async companyInfo(apiKey: string, clientId: string, userId: string) {
    const ozonClientId = Number(clientId);
    const existing = await this.prisma.organization.findUnique({
      where: { ozonClientId },
      select: { userId: true },
    });
    if (existing && existing.userId !== userId) {
      throw new ConflictException('Этот магазин OZON уже подключён к другому аккаунту easyfts');
    }

    // уже подключён этим юзером (повтор после сбоя сети) — n8n не дёргаем, отдаём существующую
    if (!existing) {
      // фронт проверяет ключ до «Далее», но бэк не доверяет: с нерабочим ключом n8n создал бы пустую оргу
      const check = await checkOzonKey(clientId, apiKey);
      if (!check.valid) throw new BadRequestException(check.error);

      const n8nUrl = this.config.getOrThrow<string>('N8N_URL');
      const res = await fetch(`${n8nUrl}/webhook/get_company_info`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.n8nToken()}`,
        },
        body: JSON.stringify({ api_key: apiKey, client_id: clientId, user_id: userId }),
      });
      if (!res.ok) {
        throw new Error(`n8n company-info failed: ${res.status}`);
      }
      await res.json();
    }

    // именно созданную оргу: при добавлении второй getFirstOrganization вернул бы первую,
    // и шаг 2 мастера сохранял бы адрес/декларанта не в ту организацию
    const organization = await this.prisma.organization.findFirst({
      where: { ozonClientId, userId },
      include: { declarant: DECLARANT_SELECT },
    });
    if (!organization) throw new NotFoundException('Организация не создана — проверьте ключи OZON');
    return toClient(organization);
  }

  // ручной запуск / онбординг: ждём только захват статуса, сам прогон (часы) идёт в фоне
  async classify(userId: string, clientId: string) {
    const ozonClientId = Number(clientId);
    const org = await this.prisma.organization.findFirst({
      where: { ozonClientId, userId },
      select: { ozonApiKey: true },
    });
    if (!org) throw new NotFoundException('Организация не найдена');

    const started = await this.acquireSync(ozonClientId);
    if (started) {
      this.runClassify(clientId, decryptField(org.ozonApiKey)).catch((e) =>
        this.logger.warn(`Classify failed for client ${clientId}: ${(e as Error).message}`),
      );
    }
    return { started };
  }

  // крон: по очереди, ждём завершения прогона
  async triggerClassify(clientId: string, apiKey: string): Promise<boolean> {
    if (!(await this.acquireSync(Number(clientId)))) {
      this.logger.log(`Classify for client ${clientId} already running — skip`);
      return false;
    }
    await this.runClassify(clientId, apiKey);
    return true;
  }

  // статус RUNNING = блокировка: атомарно, второй прогон по той же орге не стартует (зависший — не держит)
  private async acquireSync(ozonClientId: number): Promise<boolean> {
    const { count } = await this.prisma.organization.updateMany({
      where: {
        ozonClientId,
        OR: [
          { productsSyncStatus: null },
          { productsSyncStatus: { not: 'RUNNING' } },
          { productsSyncStartedAt: { lt: new Date(Date.now() - SYNC_STALE_MS) } },
        ],
      },
      data: { productsSyncStatus: 'RUNNING', productsSyncStartedAt: new Date(), productsSyncError: null },
    });
    return count > 0;
  }

  private async runClassify(clientId: string, apiKey: string): Promise<void> {
    const ozonClientId = Number(clientId);
    const n8nUrl = this.config.getOrThrow<string>('N8N_URL');
    try {
      // вебхук отвечает по завершении прогона (часы на больших каталогах) — у fetch лимит 5 мин на заголовки, поэтому axios
      await axios.post(
        `${n8nUrl}/webhook/classify_TNVED`,
        { client_id: clientId, api_key: apiKey },
        {
          headers: { Authorization: `Bearer ${this.n8nToken()}` },
          timeout: 3 * 60 * 60 * 1000,
        },
      );
      // только если всё ещё RUNNING: n8n мог прислать ozon.api-error (→ FAILED) и всё равно ответить 200
      await this.prisma.organization.updateMany({
        where: { ozonClientId, productsSyncStatus: 'RUNNING' },
        data: { productsSyncStatus: 'DONE', productsSyncedAt: new Date() },
      });
    } catch (e) {
      await this.prisma.organization.updateMany({
        where: { ozonClientId, productsSyncStatus: 'RUNNING' },
        data: { productsSyncStatus: 'FAILED', productsSyncError: 'failed' },
      });
      throw e;
    }
  }

  // шаг 1 онбординга: живой статус ключа до создания организации
  async checkApiKey(userId: string, clientId: string, apiKey: string) {
    if ((await this.redis.incrWindow(`ozon-key-check:${userId}`, KEY_CHECK_WINDOW)) > KEY_CHECK_LIMIT) {
      throw new HttpException('Слишком много проверок — подождите минуту', HttpStatus.TOO_MANY_REQUESTS);
    }
    return checkOzonKey(clientId, apiKey);
  }

  async updateOrganization(userId: string, dto: UpdateOrganizationDto) {
    const data = pick(dto, ORG_EDITABLE);
    if (typeof data.ozonApiKey === 'string') data.ozonApiKey = encryptField(data.ozonApiKey);
    const { count } = await this.prisma.organization.updateMany({
      where: { id: dto.id, userId },
      data,
    });
    if (!count) throw new NotFoundException('Организация не найдена');
    return { message: 'Организация обновлена!' };
  }

  async getDeclarantById(id: string, userId: string) {
    const declarant = await this.prisma.declarant.findFirst({
      where: { id, organization: { userId } },
      include: { document: true },
    });
    if (!declarant) throw new NotFoundException('Декларант не найден');
    return { ...declarant, document: decryptDocument(declarant.document) };
  }

  async updateDeclarant(userId: string, dto: UpdateDeclarantDto) {
    const { count } = await this.prisma.declarant.updateMany({
      where: { id: dto.id, organization: { userId } },
      data: pick(dto, DECLARANT_EDITABLE),
    });
    if (!count) throw new NotFoundException('Декларант не найден');
    return { message: 'Декларант успешно обновлен!' };
  }

  // orgId — орга со страницы; без него первая (раньше всегда первая — у второй орги показывался статус чужого ключа)
  async validateApiKey(userId: string, orgId?: string) {
    const org = await this.prisma.organization.findFirst({
      where: { userId, ...(orgId && { id: orgId }) },
      orderBy: { createdAt: 'asc' },
      select: { ozonApiKey: true, ozonClientId: true },
    });

    if (!org) throw new NotFoundException('Организация не найдена');

    const check = await checkOzonKey(org.ozonClientId, decryptField(org.ozonApiKey));
    return check.valid ? { valid: true } : { valid: false, error: check.error };
  }

  async createDocument(userId: string, dto: CreateDocumentDto) {
    const { declarantId, issuedAt, ...rest } = dto;
    // серия, номер и «кем выдан» — в БД только зашифрованными
    const data = encryptDocument(rest);
    const owned = await this.prisma.declarant.count({ where: { id: declarantId, organization: { userId } } });
    if (!owned) throw new NotFoundException('Декларант не найден');

    await this.prisma.document.upsert({
      where: { declarantId },
      create: {
        ...data,
        issuedAt: new Date(issuedAt),
        declarantId,
      },
      update: {
        ...data,
        issuedAt: new Date(issuedAt),
      },
    });

    return { message: 'Документ сохранён!' };
  }
}
