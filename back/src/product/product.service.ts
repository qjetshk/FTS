import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateTnvedDto } from './dto/update-tnved.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: dto.clientId },
      select: { id: true },
    });

    const data = {
      offerId: dto.offerId,
      sku: dto.sku,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      categoryPath: dto.categoryPath,
      primaryImg: dto.primaryImg,
      images: dto.images ?? [],
      country: dto.country,
      countriesOfOrigin: dto.countriesOfOrigin ?? [],
      countryConflict: dto.countryConflict,
    };

    return this.prisma.product.upsert({
      where: {
        productId_organizationId: {
          productId: dto.productId,
          organizationId: organization.id,
        },
      },
      create: { ...data, productId: dto.productId, organizationId: organization.id },
      update: data,
    });
  }

  async updateProduct(dto: CreateProductDto) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: dto.clientId },
      select: { id: true },
    });

    return this.prisma.product.update({
      where: {
        productId_organizationId: {
          productId: dto.productId,
          organizationId: organization.id,
        },
      },
      data: {
        offerId: dto.offerId,
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        category: dto.category,
        categoryPath: dto.categoryPath,
        primaryImg: dto.primaryImg,
        images: dto.images ?? [],
        country: dto.country,
        countriesOfOrigin: dto.countriesOfOrigin ?? [],
        countryConflict: dto.countryConflict,
        // tnved не трогаем
      },
    });
  }

  async getExistingProductIds(clientId: number) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: clientId },
      select: { id: true },
    });

    const products = await this.prisma.product.findMany({
      where: { organizationId: organization.id },
      select: { productId: true },
    });

    return products.map((p) => p.productId);
  }

  async updateTnved(dto: UpdateTnvedDto) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: dto.clientId },
      select: { id: true },
    });

    const product = await this.prisma.product.findUnique({
      where: {
        productId_organizationId: {
          productId: dto.productId,
          organizationId: organization.id,
        },
      },
      select: { id: true },
    });

    if (!product) {
      throw new NotFoundException(`Product ${dto.productId} not found`);
    }

    return this.prisma.$transaction([
      this.prisma.tnvedAlternative.deleteMany({
        where: { productId: product.id },
      }),
      this.prisma.product.update({
        where: { id: product.id },
        data: {
          tnvedCode: dto.tnvedCode,
          tnvedName: dto.tnvedName,
          tnvedUnit: dto.tnvedUnit,
          tnvedStatus: dto.tnvedStatus,
          tnvedAlternatives: {
            create: (dto.tnvedAlternatives ?? []).map((a) => ({
              tnvedCode: a.tnvedCode,
              tnvedName: a.tnvedName,
              tnvedUnit: a.tnvedUnit,
            })),
          },
        },
      }),
    ]);
  }

  // эндпоинты кабинета принимают clientId из запроса — без проверки любой юзер читал/менял товары чужой организации
  async assertOwner(userId: string, clientId: number) {
    const owned = await this.prisma.organization.count({ where: { ozonClientId: Number(clientId), userId } });
    if (!owned) throw new NotFoundException('Организация не найдена');
  }

  // статус синхронизации каталога + классификации — шаг 3 онбординга показывает прогресс или причину сбоя
  async getSyncStatus(clientId: number) {
    return this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: Number(clientId) },
      select: { productsSyncStatus: true, productsSyncError: true, productsSyncStartedAt: true, productsSyncedAt: true },
    });
  }

  async getProductsSnapshot(clientId: number) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: Number(clientId) },
      select: { id: true },
    });

    return this.prisma.product.findMany({
      where: { organizationId: organization.id },
      select: {
        productId: true,
        sku: true,
        name: true,
        categoryPath: true,
        tnvedStatus: true,
        tnvedCode: true,
        country: true,
        countryConflict: true,
      },
    });
  }

  async getProducts(dto: GetProductsDto) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: dto.clientId },
      select: { id: true },
    });

    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where: { organizationId: organization.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { tnvedAlternatives: true },
      }),
      this.prisma.product.count({
        where: { organizationId: organization.id },
      }),
    ]);

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async verifyAllTnved(clientId: number) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: clientId },
      select: { id: true },
    });

    await this.prisma.product.updateMany({
      where: {
        organizationId: organization.id,
        tnvedStatus: { not: null },
      },
      data: { tnvedStatus: 'VERIFIED_BY_USER' },
    });

    return { message: 'Все коды подтверждены' };
  }

  async updateCountry(dto: UpdateCountryDto) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: dto.clientId },
      select: { id: true },
    });

    await this.prisma.product.update({
      where: {
        productId_organizationId: {
          productId: dto.productId,
          organizationId: organization.id,
        },
      },
      data: {
        country: dto.country,
        countryConflict: false,
      },
    });

    return { message: 'Страна обновлена' };
  }
}
