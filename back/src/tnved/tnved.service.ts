import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TnvedService {
  constructor(private prisma: PrismaService) {}

  async search(q: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { code: { contains: q, mode: 'insensitive' as const } },
        { name: { contains: q, mode: 'insensitive' as const } },
      ],
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.tnvedLc.findMany({
        where,
        select: { code: true, name: true, unit: true },
        orderBy: { code: 'asc' },
        skip,
        take: limit,
      }),
      this.prisma.tnvedLc.count({ where }),
    ]);

    return { items, total, page, limit };
  }
}
