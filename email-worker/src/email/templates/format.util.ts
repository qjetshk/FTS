const COUNTRY_NAME: Record<string, string> = {
  BY: 'Беларусь',
  KZ: 'Казахстан',
  AM: 'Армения',
  KG: 'Кыргызстан',
};

export const countryName = (code: string) => COUNTRY_NAME[code] ?? code;

// plural(5, ['товар', 'товара', 'товаров']) → '5 товаров'
export function plural(n: number, forms: [string, string, string]): string {
  const rules = new Intl.PluralRules('ru-RU').select(n);
  const form = rules === 'one' ? forms[0] : rules === 'few' ? forms[1] : forms[2];
  return `${n} ${form}`;
}

export const productsCount = (n: number) => plural(n, ['товар', 'товара', 'товаров']);

// '2026-09' → 'сентябрь 2026'
export function formatPeriod(period: string): string {
  const [year, month] = period.split('-').map(Number);
  const monthName = new Intl.DateTimeFormat('ru-RU', { month: 'long' }).format(new Date(year, month - 1, 1));
  return `${monthName} ${year}`;
}
