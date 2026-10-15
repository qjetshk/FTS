// Проверка CSV-отчёта об отправлениях OZON, который юзер загрузил вместо автоматической выгрузки.
// Формат как у отчёта /v1/report/postings: «;», UTF-8 с BOM, время московское без пояса ('2026-09-01 06:30:00').
// Месяц статформы — месяц ОТГРУЗКИ (seller-edu Ozon «Статистическая форма учёта»), а отчёт за период OZON
// отбирает по «Принят в обработку». Заказ, принятый 30-го, отгружают уже в следующем месяце, поэтому Ozon советует
// брать отчёт за нужный и предыдущий месяц. Отсюда правила: заказов, принятых ПОЗЖЕ выбранного месяца, быть не должно
// (не тот отчёт), отгрузки в выбранном месяце — должны быть; строки за прошлые месяцы n8n отфильтрует по дате отгрузки.

const REQUIRED_COLUMNS = ['Номер отправления', 'Принят в обработку', 'Дата отгрузки', 'Статус', 'Кластер доставки', 'SKU', 'Количество'];
const PROCESSED_COLUMN = 'Принят в обработку';
const SHIPPED_COLUMN = 'Дата отгрузки';
const MONTHS_RU = ['январь', 'февраль', 'март', 'апрель', 'май', 'июнь', 'июль', 'август', 'сентябрь', 'октябрь', 'ноябрь', 'декабрь'];

export class CsvReportError extends Error {}

const monthLabel = (ym: string) => {
  const [y, m] = ym.split('-').map(Number);
  return `${MONTHS_RU[m - 1]} ${y}`;
};

// одна строка CSV с «;» и кавычками ("a;b", "" внутри поля)
function splitRow(line: string): string[] {
  const cells: string[] = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ';') {
      cells.push(cell);
      cell = '';
    } else cell += ch;
  }
  cells.push(cell);
  return cells.map((c) => c.trim());
}

const yearMonth = (raw: string | undefined): string | null => {
  if (!raw) return null;
  const m = /^(\d{4})-(\d{2})-\d{2}/.exec(raw);
  if (!m) throw new CsvReportError(`Не удалось прочитать дату «${raw}» — загрузите файл в исходном формате OZON.`);
  return `${m[1]}-${m[2]}`;
};

/**
 * Бросает CsvReportError с текстом для юзера, если файл не отчёт OZON об отправлениях,
 * в нём есть заказы, принятые после выбранного месяца, нет заказов этого месяца или нет ни одной отгрузки в нём.
 * Возвращает число отгрузок в выбранном месяце.
 */
export function validatePostingsCsv(csv: string, period: string): number {
  const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) throw new CsvReportError('Файл пустой — выгрузите отчёт об отправлениях из личного кабинета OZON.');

  const header = splitRow(lines[0]);
  const missing = REQUIRED_COLUMNS.filter((c) => !header.includes(c));
  if (missing.length) {
    throw new CsvReportError(
      `Это не отчёт OZON об отправлениях: нет колонок ${missing.map((c) => `«${c}»`).join(', ')}. ` +
        'Выгрузите CSV «Отправления» из личного кабинета OZON без изменений.',
    );
  }

  const processedIdx = header.indexOf(PROCESSED_COLUMN);
  const shippedIdx = header.indexOf(SHIPPED_COLUMN);
  const later = new Set<string>();
  let shippedInPeriod = 0;
  let processedInPeriod = 0;
  for (const line of lines.slice(1)) {
    const cells = splitRow(line);
    const processed = yearMonth(cells[processedIdx]);
    if (processed && processed > period) later.add(processed);
    if (processed === period) processedInPeriod++;
    if (yearMonth(cells[shippedIdx]) === period) shippedInPeriod++;
  }

  if (later.size) {
    const found = [...later].sort().map(monthLabel).join(', ');
    throw new CsvReportError(
      `В отчёте есть заказы за ${found}, а выбран ${monthLabel(period)}. ` +
        `Выберите нужный месяц или выгрузите отчёт, где последний месяц — ${monthLabel(period)}.`,
    );
  }
  // отчёт только за прошлый месяц: отгрузки по заказам этого месяца в нём нет — статформа вышла бы неполной
  if (!processedInPeriod) {
    throw new CsvReportError(
      `В отчёте нет заказов за ${monthLabel(period)} — статформа выйдет неполной. ` +
        `Выгрузите отчёт за ${monthLabel(period)} и предыдущий месяц.`,
    );
  }
  if (!shippedInPeriod) {
    throw new CsvReportError(
      `В отчёте нет отгрузок за ${monthLabel(period)} — формировать нечего. ` +
        'Проверьте месяц: статформа считается по дате отгрузки.',
    );
  }
  return shippedInPeriod;
}
