import { cn } from "@/shared/lib"
import type { PainKind } from "../config/landing.data"

const MONO = "ui-monospace, monospace"

// Линейные картинки к «болям»: цвет линий — currentColor, активная карточка подсвечивает их зелёным
export function PainIllustration({ kind, active }: { kind: PainKind; active: boolean }) {
  return (
    <svg
      viewBox="0 0 200 140"
      fill="none"
      strokeWidth={2}
      aria-hidden="true"
      className={cn("h-[140px] w-[200px] stroke-current", active ? "text-primary" : "text-border-strong")}
    >
      {kind === "editor" && (
        <>
          <rect x="14" y="14" width="172" height="112" rx="10" className="fill-surface" />
          <line x1="14" y1="38" x2="186" y2="38" />
          {[26, 36, 46].map((cx) => (
            <circle key={cx} cx={cx} cy="26" r="2.5" className="fill-current" />
          ))}
          <rect x="28" y="52" width="42" height="6" rx="2" className="fill-current stroke-none" opacity="0.6" />
          <rect x="28" y="64" width="144" height="14" rx="3" className="fill-background" />
          <rect x="28" y="88" width="56" height="6" rx="2" className="fill-current stroke-none" opacity="0.6" />
          <rect x="28" y="100" width="144" height="14" rx="3" className="fill-background" />
          <line x1="36" y1="68" x2="36" y2="74" strokeLinecap="round" />
        </>
      )}
      {kind === "one-c" && (
        <>
          <path d="M50 50 L100 34 L150 50 L150 102 L100 118 L50 102 Z" strokeLinejoin="round" className="fill-surface" />
          <path d="M50 50 L100 66 L150 50" strokeLinejoin="round" />
          <path d="M100 66 L100 118" />
          <text x="100" y="92" textAnchor="middle" fontFamily={MONO} fontSize="16" fontWeight="600" className="fill-current stroke-none">
            1C
          </text>
          <circle cx="130" cy="44" r="20" className="fill-background" />
          <line x1="116" y1="58" x2="144" y2="30" strokeLinecap="round" />
        </>
      )}
      {kind === "transfer" && (
        <>
          <rect x="14" y="44" width="68" height="52" rx="8" className="fill-surface" />
          <text x="48" y="76" textAnchor="middle" fontSize="13" fontWeight="600" className="fill-current stroke-none">
            Ozon
          </text>
          <line x1="86" y1="70" x2="114" y2="70" strokeLinecap="round" />
          <path d="M108 64 L116 70 L108 76" strokeLinecap="round" strokeLinejoin="round" />
          <rect x="118" y="44" width="68" height="52" rx="8" className="fill-surface" />
          <text x="152" y="76" textAnchor="middle" fontFamily={MONO} fontSize="13" fontWeight="600" className="fill-current stroke-none">
            XML
          </text>
        </>
      )}
      {kind === "codes" &&
        ["3304990000", "8517620009", "6109100009"].map((code, i) => {
          const y = 38 + i * 32
          const hl = i === 1
          return (
            <g key={code} className={hl ? "text-primary" : undefined}>
              <rect x="14" y={y} width="172" height="26" rx="6" className={hl && active ? "fill-primary-light" : "fill-surface"} />
              <text x="26" y={y + 17} fontFamily={MONO} fontSize="12" fontWeight="500" className="fill-current stroke-none">
                {code}
              </text>
              <rect x="124" y={y + 8} width="48" height="10" rx="2" className="fill-current stroke-none" opacity={hl ? 0.85 : 0.35} />
            </g>
          )
        })}
    </svg>
  )
}
