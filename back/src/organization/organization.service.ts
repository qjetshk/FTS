import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';

@Injectable()
export class OrganizationService {
  constructor(private prisma: PrismaService) {}

  async createOrganization(dto: CreateOrganizationDto) {
    const exists = await this.prisma.organization.findUnique({
      where: {
        inn: dto.inn,
      },
    });

    if (exists) {
      throw new ConflictException('Такая организация уже существует!');
    }

    const organization = await this.prisma.organization.create({
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
      where: {
        userId,
      },
      omit: {
        ozonApiKey: true,
        ozonClientId: true,
      },
      include: {
        declarant: {
          select: {
            name: true,
            surname: true,
            patronymic: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Организация не найдена');
    }

    return organization;
  }

  async getOrganization(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: {
        id,
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
}
