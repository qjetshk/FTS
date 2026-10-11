import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

type TnvedItem = { code: string; name: string; unit: string | null };

// экранируем спецсимволы LIKE, чтобы «%» или «_» в запросе искались буквально
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);

@Injectable()
export class TnvedService {
  constructor(private prisma: PrismaService) {}

  // Ищем одновременно:
  //  — по началу кода: «3304» → вся подсубпозиция 3304, пробелы игнорируются («3304 99» = «330499»);
  //  — по названию: все слова запроса должны встретиться в наименовании («крем лицо»), без учёта регистра.
  // Совпадения по коду — выше, внутри групп — по коду.
  async search(q: string, page: number, limit: number) {
    const query = q.trim();
    const codePrefix = /^[\d\s]+$/.test(query) ? query.replace(/\s/g, '') : null;
    const words = query.split(/\s+/).filter(Boolean);

    const byCode = codePrefix ? Prisma.sql`code LIKE ${escapeLike(codePrefix) + '%'}` : Prisma.sql`FALSE`;
    const byName = Prisma.join(
      words.map((w) => Prisma.sql`name ILIKE ${'%' + escapeLike(w) + '%'}`),
      ' AND ',
    );
    const where = Prisma.sql`(${byCode}) OR (${byName})`;
    // константу в ORDER BY Postgres не принимает — приоритет кода только когда запрос похож на код
    const orderBy = codePrefix ? Prisma.sql`(${byCode}) DESC, code` : Prisma.sql`code`;

    const [items, [{ total }]] = await Promise.all([
      this.prisma.$queryRaw<TnvedItem[]>`
        SELECT code, name, unit FROM tnved_lc
        WHERE ${where}
        ORDER BY ${orderBy}
        LIMIT ${limit} OFFSET ${(page - 1) * limit}`,
      this.prisma.$queryRaw<[{ total: number }]>`
        SELECT count(*)::int AS total FROM tnved_lc WHERE ${where}`,
    ]);

    return { items, total, page, limit };
  }
}
