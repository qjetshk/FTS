// Вымышленные данные листов статформ в hero (продавец, товары, суммы — демо)

export const SHEET_CLASS = "h-[400px] w-[300px] rounded-[20px] shadow-[0_30px_60px_-20px_rgb(0_0_0/0.55)]"

export const PAPER_GOODS = [
  { name: "Крем для лица, 50 мл", code: "3304 99 000 0", usd: "25,00" },
  { name: "Наушники беспроводные", code: "8518 30 000 2", usd: "36,80" },
  { name: "Кабель USB-C, 1 м", code: "8544 42 900 9", usd: "4,90" },
]

// [отступ, открывающий тег, значение, закрывающий тег]
export const XML_LINES: [number, string, string?, string?][] = [
  [0, "<StaticForm>"],
  [1, "<CountryCode>", "BY", "</CountryCode>"],
  [1, "<Period>", "2026-09", "</Period>"],
  [1, "<Goods>"],
  [2, "<GoodsTNVEDCode>", "9617000000", "</…>"],
  [2, "<GoodsQuantity>", "3", "</…>"],
  [2, "<CustCostAmount>", "14.60", "</…>"],
  [1, "</Goods>"],
  [1, "<Goods>"],
  [2, "<GoodsTNVEDCode>", "6109100000", "</…>"],
  [2, "<CustCostAmount>", "9.20", "</…>"],
  [1, "</Goods>"],
  [1, "<CustCostTotal>", "23.80", "</…>"],
  [0, "</StaticForm>"],
]
