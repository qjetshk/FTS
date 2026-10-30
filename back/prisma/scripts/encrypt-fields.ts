// Разовое шифрование полей, записанных до DATA_ENCRYPTION_KEY: API-ключ OZON и серия/номер/«кем выдан» документа.
// Запуск: docker exec fts-back npm run encrypt:fields
// Уже зашифрованные значения пропускаются — безопасно перезапускать.
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { encryptField, isEncryptedField } from '../../src/utils/field-crypto.util';

async function main() {
  const prisma = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) });
  try {
    const orgs = await prisma.organization.findMany({ select: { id: true, ozonApiKey: true } });
    const plainOrgs = orgs.filter((o) => !isEncryptedField(o.ozonApiKey));
    for (const o of plainOrgs) {
      await prisma.organization.update({ where: { id: o.id }, data: { ozonApiKey: encryptField(o.ozonApiKey) } });
    }

    const docs = await prisma.document.findMany({ select: { id: true, series: true, number: true, issuedBy: true } });
    const plainDocs = docs.filter((d) => [d.series, d.number, d.issuedBy].some((v) => v !== null && !isEncryptedField(v)));
    for (const d of plainDocs) {
      await prisma.document.update({
        where: { id: d.id },
        data: { series: encryptField(d.series), number: encryptField(d.number), issuedBy: encryptField(d.issuedBy) },
      });
    }

    console.log(`Организаций зашифровано: ${plainOrgs.length} из ${orgs.length}, документов: ${plainDocs.length} из ${docs.length}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
