interface IllustrationProps {
  active: boolean;
}

const commonStyle = (active: boolean) => ({
  display: "block" as const,
  transition: "transform 450ms ease, opacity 450ms ease",
  transform: active ? "scale(1)" : "scale(0.96)",
  opacity: active ? 1 : 0.85,
});

export function EditorIllustration({ active }: IllustrationProps) {
  const stroke = active ? "var(--primary)" : "var(--border-strong)";
  const fill = "var(--tl-illus-fill)";
  const sw = 2;
  return (
    <svg width={200} height={140} viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={commonStyle(active)}>
      <rect x="14" y="14" width="172" height="112" rx="10" fill={fill} stroke={stroke} strokeWidth={sw} />
      <line x1="14" y1="38" x2="186" y2="38" stroke={stroke} strokeWidth={sw} />
      <circle cx="26" cy="26" r="2.5" fill={stroke} />
      <circle cx="36" cy="26" r="2.5" fill={stroke} />
      <circle cx="46" cy="26" r="2.5" fill={stroke} />
      <rect x="28" y="52" width="42" height="6" rx="2" fill={stroke} opacity="0.6" />
      <rect x="28" y="64" width="144" height="14" rx="3" stroke={stroke} strokeWidth={sw} fill="var(--tl-card-bg)" />
      <rect x="28" y="88" width="56" height="6" rx="2" fill={stroke} opacity="0.6" />
      <rect x="28" y="100" width="144" height="14" rx="3" stroke={stroke} strokeWidth={sw} fill="var(--tl-card-bg)" />
      <line x1="36" y1="68" x2="36" y2="74" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function OneCIllustration({ active }: IllustrationProps) {
  const stroke = active ? "var(--primary)" : "var(--border-strong)";
  const fill = "var(--tl-illus-fill)";
  const sw = 2;
  return (
    <svg width={200} height={140} viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={commonStyle(active)}>
      <path d="M50 50 L100 34 L150 50 L150 102 L100 118 L50 102 Z" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
      <path d="M50 50 L100 66 L150 50" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" fill="none" />
      <path d="M100 66 L100 118" stroke={stroke} strokeWidth={sw} />
      <text x="100" y="92" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="16" fontWeight="600" fill={stroke}>1C</text>
      <circle cx="130" cy="44" r="20" fill="var(--tl-card-bg)" stroke={stroke} strokeWidth={sw} />
      <line x1="116" y1="58" x2="144" y2="30" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
    </svg>
  );
}

export function TransferIllustration({ active }: IllustrationProps) {
  const stroke = active ? "var(--primary)" : "var(--border-strong)";
  const fill = "var(--tl-illus-fill)";
  const sw = 2;
  return (
    <svg width={200} height={140} viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={commonStyle(active)}>
      <rect x="14" y="44" width="68" height="52" rx="8" fill={fill} stroke={stroke} strokeWidth={sw} />
      <text x="48" y="76" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="13" fontWeight="600" fill={stroke}>Ozon</text>
      <line x1="86" y1="70" x2="114" y2="70" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <path d="M108 64 L116 70 L108 76" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="118" y="44" width="68" height="52" rx="8" fill={fill} stroke={stroke} strokeWidth={sw} />
      <text x="152" y="76" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="13" fontWeight="600" fill={stroke}>XML</text>
      <circle cx="94" cy="58" r="1.6" fill={stroke} />
      <circle cx="100" cy="58" r="1.6" fill={stroke} />
      <circle cx="106" cy="58" r="1.6" fill={stroke} />
    </svg>
  );
}

export function CodesIllustration({ active }: IllustrationProps) {
  const stroke = active ? "var(--primary)" : "var(--border-strong)";
  const fill = "var(--tl-illus-fill)";
  const sw = 2;
  const rowY = [38, 70, 102];
  return (
    <svg width={200} height={140} viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={commonStyle(active)}>
      {rowY.map((y, i) => {
        const hl = i === 1;
        const rStroke = hl ? "#16A34A" : stroke;
        const rFill = hl && active ? "rgba(22,163,74,0.08)" : fill;
        return (
          <g key={i}>
            <rect x="14" y={y} width="172" height="26" rx="6" fill={rFill} stroke={rStroke} strokeWidth={hl ? sw + 0.5 : sw} />
            <text x="26" y={y + 17} fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="12" fontWeight="500" fill={rStroke}>
              {["3304990000", "8517620009", "6109100009"][i]}
            </text>
            <rect x="124" y={y + 8} width="48" height="10" rx="2" fill={rStroke} opacity={hl ? 0.85 : 0.35} />
          </g>
        );
      })}
    </svg>
  );
}
