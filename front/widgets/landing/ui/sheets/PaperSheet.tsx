import { PAPER_GOODS, SHEET_CLASS } from "../../config/hero-sheets.data"

// Передний лист — статформа так, как её видит продавец
export function PaperSheet() {
  return (
    <div className={`${SHEET_CLASS} relative flex flex-col bg-white p-5 text-slate-900 ring-1 ring-black/5`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium tracking-[0.12em] text-slate-400 uppercase">Статформа</span>
        <span className="rounded-md bg-green-50 px-1.5 py-0.5 font-mono text-[11px] font-medium text-green-700">KZ</span>
      </div>
      <p className="mt-2 font-display text-[19px] leading-tight font-medium tracking-tight">Казахстан</p>
      <p className="text-[12px] text-slate-500">Сентябрь 2026 · месяц отгрузки</p>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-[11px]">
        <dt className="text-slate-400">Отправитель</dt>
        <dd className="truncate text-right">ИП Соколова А. В.</dd>
        <dt className="text-slate-400">Курс ЦБ</dt>
        <dd className="text-right font-mono">81,45 ₽/$</dd>
      </dl>

      <div className="mt-4 border-t border-slate-100">
        {PAPER_GOODS.map((g) => (
          <div key={g.code} className="flex items-baseline gap-2 border-b border-slate-100 py-2 text-[11px]">
            <div className="min-w-0 flex-1">
              <p className="truncate">{g.name}</p>
              <p className="font-mono text-[10px] text-slate-400">{g.code}</p>
            </div>
            <span className="font-mono">${g.usd}</span>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-end justify-between">
        <div>
          <p className="text-[10px] text-slate-400">Итого</p>
          <p className="font-mono text-[15px] font-medium">$66,70</p>
        </div>
        <span className="-rotate-12 rounded-lg border-2 border-green-600/80 px-2 py-1 text-center text-[10px] leading-tight font-semibold tracking-wide text-green-700 uppercase">
          Готово
          <br />
          <span className="font-mono font-medium normal-case">XML</span>
        </span>
      </div>
    </div>
  )
}
