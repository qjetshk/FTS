import { SHEET_CLASS } from "../../config/hero-sheets.data"

// Задний лист — только силуэт: стекло с зелёным оттенком и «строки» без текста
export function GlassSheet() {
  return (
    <div
      className={`${SHEET_CLASS} flex flex-col gap-3 border border-white/20 bg-[linear-gradient(160deg,rgb(187_247_208/0.22),rgb(22_163_74/0.10))] p-5 backdrop-blur-md`}
    >
      <div className="flex items-center justify-between">
        <span className="h-2 w-16 rounded-full bg-white/30" />
        <span className="rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[11px] text-white/80">AM</span>
      </div>
      <span className="h-3.5 w-28 rounded-full bg-white/40" />
      <span className="h-2 w-36 rounded-full bg-white/20" />
      <div className="mt-3 flex flex-col gap-3">
        {["w-[54%]", "w-[42%]", "w-[48%]", "w-[36%]"].map((w, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className={`h-2 rounded-full bg-white/25 ${w}`} />
            <span className="ml-auto h-2 w-10 rounded-full bg-white/20" />
          </div>
        ))}
      </div>
      <span className="mt-auto size-12 self-end rounded-full border-2 border-white/30" />
    </div>
  )
}
