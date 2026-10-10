import type { ColumnDef } from "@tanstack/react-table"
import type { Product } from "@/entities/product"

export const COLUMNS: ColumnDef<Product>[] = [
  { id: "img", header: "", size: 52, enableResizing: false },
  { id: "name", header: "Название", size: 280, minSize: 120 },
  { id: "category", header: "Категория", size: 180, minSize: 90 },
  { id: "country", header: "Страна-изготовитель", size: 180, minSize: 120 },
  { id: "offerId", header: "Артикул", size: 180, minSize: 90 },
  { id: "sku", header: "SKU", size: 120, minSize: 80 },
  { id: "tnved", header: "ТН ВЭД", size: 400, minSize: 160 },
  { id: "unit", header: "Ед.", size: 64, minSize: 48 },
]
export const MAIN_LIMIT = 15
