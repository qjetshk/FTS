import { SHEET_CLASS, XML_LINES } from "../../config/hero-sheets.data"

// Средний лист — та же статформа в XML, как она уходит в ФТС; подсветка как в терминале
export function XmlSheet() {
  return (
    <div className={`${SHEET_CLASS} flex flex-col overflow-hidden bg-(--term-bg) ring-1 ring-white/10`}>
      <div className="flex items-center gap-1.5 bg-(--term-bar) px-4 py-2.5">
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="size-2 rounded-full bg-white/15" />
        <span className="ml-2 font-mono text-[10px] text-(--term-comment)">BY_statform_09-26.xml</span>
      </div>
      <pre className="flex-1 px-4 py-3 font-mono text-[10.5px] leading-[1.75]">
        <span className="text-(--term-comment)">{'<?xml version="1.0"?>'}</span>
        {"\n"}
        {XML_LINES.map(([depth, open, value, close], i) => (
          <span key={i}>
            {"  ".repeat(depth)}
            <span className="text-(--term-tag)">{open}</span>
            {value && <span className="text-(--term-value)">{value}</span>}
            {close && <span className="text-(--term-tag)">{close}</span>}
            {"\n"}
          </span>
        ))}
      </pre>
      <div className="flex items-center gap-1.5 border-t border-(--term-border) px-4 py-2.5 font-mono text-[10px] text-(--term-ok)">
        <span className="size-1.5 rounded-full bg-(--term-ok)" />
        XSD ФТС: валиден
      </div>
    </div>
  )
}
