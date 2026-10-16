import { CsvReportError, validatePostingsCsv } from './csv-report';

const HEADER = 'Номер отправления;Принят в обработку;Дата отгрузки;Статус;Кластер доставки;SKU;Количество';
const row = (processed: string, shipped: string) =>
  `0123456789-0001-1;${processed} 10:00:00;${shipped} 12:00:00;Доставлен;Казахстан;1800200300;1`;
const csv = (...rows: string[]) => '﻿' + [HEADER, ...rows].join('\r\n');

describe('validatePostingsCsv — проверка загруженного отчёта OZON', () => {
  it('принимает отчёт за выбранный и предыдущий месяц и считает отгрузки месяца', () => {
    const file = csv(row('2026-08-30', '2026-09-02'), row('2026-09-10', '2026-09-12'), row('2026-08-05', '2026-08-07'));
    expect(validatePostingsCsv(file, '2026-09')).toBe(2);
  });

  it('отклоняет файл без обязательных колонок', () => {
    expect(() => validatePostingsCsv('Название;Цена\nТовар;100', '2026-09')).toThrow(/нет колонок/);
  });

  it('отклоняет пустой файл', () => {
    expect(() => validatePostingsCsv(HEADER, '2026-09')).toThrow(CsvReportError);
  });

  it('отклоняет отчёт с заказами позже выбранного месяца', () => {
    const file = csv(row('2026-09-10', '2026-09-12'), row('2026-10-01', '2026-10-02'));
    expect(() => validatePostingsCsv(file, '2026-09')).toThrow(/октябрь 2026/);
  });

  it('отклоняет отчёт только за предыдущий месяц — статформа вышла бы неполной', () => {
    const file = csv(row('2026-08-30', '2026-09-02'));
    expect(() => validatePostingsCsv(file, '2026-09')).toThrow(/нет заказов за сентябрь 2026/);
  });

  it('отклоняет отчёт без отгрузок в выбранном месяце', () => {
    const file = csv(row('2026-09-29', '2026-10-01'));
    expect(() => validatePostingsCsv(file, '2026-09')).toThrow(/нет отгрузок/);
  });

  it('отклоняет файл с датами не в формате OZON', () => {
    const file = csv('0123456789-0001-1;29.09.2026;01.10.2026;Доставлен;Казахстан;1;1');
    expect(() => validatePostingsCsv(file, '2026-09')).toThrow(/исходном формате OZON/);
  });

  it('разбирает поля в кавычках с точкой с запятой внутри', () => {
    const file = csv(`"0123;456";2026-09-10 10:00:00;2026-09-12 12:00:00;Доставлен;"Казахстан";1;1`);
    expect(validatePostingsCsv(file, '2026-09')).toBe(1);
  });
});
