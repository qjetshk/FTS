// parse_mode HTML: < > & в тексте, " — в href
export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const COUNTRY_NAME: Record<string, string> = {
  BY: 'Беларусь',
  KZ: 'Казахстан',
  AM: 'Армения',
  KG: 'Кыргызстан',
};

export const countryName = (code: string) => COUNTRY_NAME[code] ?? code;

// plural(5, ['товар', 'товара', 'товаров']) → '5 товаров'
export function plural(n: number, forms: [string, string, string]): string {
  const rule = new Intl.PluralRules('ru-RU').select(n);
  return `${n} ${rule === 'one' ? forms[0] : rule === 'few' ? forms[1] : forms[2]}`;
}

// '2026-09' → 'сентябрь 2026'
export function formatPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(year, month - 1, 1));
  return `${monthName} ${year}`;
}
