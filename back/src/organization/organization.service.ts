import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { UpdateDeclarantDto } from './dto/update-declarant.dto';
import { CreateDocumentDto } from './dto/create-document.dto';

@Injectable()
export class OrganizationService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
  ) {}

  private n8nToken(): string {
    return this.jwt.sign(
      { service: 'fts-back' },
      { secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'), expiresIn: '1m' },
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
        ozonApiKey: dto.api_key,
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

  async getFirstOrganization(userId: string) {
    const organization = await this.prisma.organization.findFirst({
      where: { userId },
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

    return organization;
  }

  async getOrganization(id: string, clientId: string) {
    const ozonClientId = Number(clientId)
    const organization = await this.prisma.organization.findFirst({
      where: {
        OR: [{ id }, { ozonClientId }],
      },
      include: {
        declarant: {
          include: {
            document: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Организация не найдена');
    }

    return organization;
  }

  async companyInfo(apiKey: string, clientId: string, userId: string) {
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
    return this.getFirstOrganization(userId);
  }

  classify(clientId: string): void {
    const n8nUrl = this.config.getOrThrow<string>('N8N_URL');
    this.prisma.organization
      .findUnique({
        where: { ozonClientId: Number(clientId) },
        select: { ozonApiKey: true },
      })
      .then((org) => {
        if (!org) return;
        fetch(`${n8nUrl}/webhook/classify_TNVED`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.n8nToken()}`,
          },
          body: JSON.stringify({ client_id: clientId, api_key: org.ozonApiKey }),
        });
      })
      .catch(() => {});
  }

  async updateOrganization(dto: UpdateOrganizationDto) {
    const { id, ...rest } = dto;
    const data = Object.fromEntries(
      Object.entries(rest).filter(([, v]) => v !== null && v !== undefined),
    ) as Record<string, string>;
    await this.prisma.organization.update({ where: { id }, data });
    return { message: 'Организация обновлена!' };
  }

  async getDeclarantById(id: string) {
    const declarant = await this.prisma.declarant.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        document: true,
      },
    });

    return declarant;
  }

  async updateDeclarant(dto: UpdateDeclarantDto) {
    const { id, ...data } = dto;
    await this.prisma.declarant.update({ where: { id }, data });
    return { message: 'Декларант успешно обновлен!' };
  }

  async createDocument(dto: CreateDocumentDto) {
    const { declarantId, issuedAt, ...data } = dto;

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
