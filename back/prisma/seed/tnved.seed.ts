// Заливка справочника ТН ВЭД (tnved_lc) из выгрузки TWS.
// Запуск: docker exec fts-back npm run seed:tnved [-- путь/к/файлу.xlsx]
// Полностью заменяет содержимое таблицы — безопасно перезапускать при обновлении справочника.
import 'dotenv/config';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const DEFAULT_FILE = path.join(__dirname, 'data', 'TWS_TNVED_2026-05-09.xlsx');
const SHEET = 'ТНВЭД';
const BATCH = 1000;

type TnvedRow = { code: string; name: string; unit: string | null };

function readRows(file: string): TnvedRow[] {
  const sheet = XLSX.readFile(file).Sheets[SHEET];
  if (!sheet) throw new Error(`Лист «${SHEET}» не найден в ${file}`);

  // колонки: Код | Наименование | Тариф | Подробности (единиц измерения в выгрузке TWS нет)
  const raw = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: false }).slice(1);

  const rows: TnvedRow[] = [];
  const skipped: unknown[] = [];
  for (const [codeCell, nameCell] of raw) {
    const code = String(codeCell ?? '').replace(/\D/g, '').padStart(10, '0');
    // уровни иерархии разделены «🠺» → приводим к « / », как в GoodsDescription статформы
    const name = String(nameCell ?? '').split('🠺').map((s) => s.trim()).filter(Boolean).join(' / ');
    if (/^\d{10}$/.test(code) && name) rows.push({ code, name, unit: null });
    else if (codeCell || nameCell) skipped.push(codeCell);
  }

  if (skipped.length) console.warn(`Пропущено строк с некорректным кодом/названием: ${skipped.length}`, skipped.slice(0, 5));
  return rows;
}

async function main() {
  const file = process.argv[2] ? path.resolve(process.argv[2]) : DEFAULT_FILE;
  const rows = readRows(file);
  const unique = [...new Map(rows.map((r) => [r.code, r])).values()];
  console.log(`Прочитано ${rows.length} кодов (уникальных ${unique.length}) из ${path.basename(file)}`);

  const prisma = new PrismaClient({ adapter: new PrismaPg(new Pool({ connectionString: process.env.DATABASE_URL })) });
  try {
    await prisma.$transaction(
      async (tx) => {
        const { count: removed } = await tx.tnvedLc.deleteMany();
        for (let i = 0; i < unique.length; i += BATCH) {
          await tx.tnvedLc.createMany({ data: unique.slice(i, i + BATCH) });
        }
        console.log(`Удалено старых: ${removed}, записано новых: ${unique.length}`);
      },
      { timeout: 120_000 },
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
