import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { TNVED_STATUS } from '@prisma/client';
import { UpdateTnvedDto } from './dto/update-tnved.dto';
import { GetProductsDto } from './dto/get-products.dto';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  async createProduct(dto: CreateProductDto) {
    const organization = await this.prisma.organization.findUniqueOrThrow({
      where: { ozonClientId: dto.clientId },
      select: { id: true },
    });

    return this.prisma.product.create({
      data: {
        productId: dto.productId,
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
        organizationId: organization.id,
      },
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

    return this.prisma.product.update({
      where: {
        productId_organizationId: {
          productId: dto.productId,
          organizationId: organization.id,
        },
      },
      data: {
        tnvedCode: dto.tnvedCode,
        tnvedName: dto.tnvedName,
        tnvedUnit: dto.tnvedUnit,
        tnvedStatus: dto.tnvedStatus,
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
}
