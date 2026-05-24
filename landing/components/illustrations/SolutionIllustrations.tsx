interface IllustrationProps {
  active: boolean;
}

const commonStyle = (active: boolean) => ({
  display: "block" as const,
  transition: "transform 500ms ease, opacity 500ms ease",
  transform: active ? "scale(1)" : "scale(0.96)",
  opacity: active ? 1 : 0.85,
});

export function BatchIllustration({ active }: IllustrationProps) {
  const stroke = active ? "var(--primary)" : "var(--border-strong)";
  const accentFill = active ? "rgba(22,163,74,0.18)" : "var(--tl-illus-fill)";
  const sw = 2;
  return (
    <svg width={210} height={150} viewBox="0 0 210 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={commonStyle(active)}>
      {[28, 56, 84, 112].map((y, i) => (
        <g key={i}>
          <rect x="10" y={y} width="76" height="20" rx="4" fill="var(--tl-illus-fill)" stroke={stroke} strokeWidth={sw} />
          <line x1="20" y1={y + 10} x2="40" y2={y + 10} stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
          <circle cx="78" cy={y + 10} r="2.4" fill={stroke} />
        </g>
      ))}
      <path d="M94 75 L120 75" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      <path d="M114 69 L122 75 L114 81" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <rect x="128" y="50" width="72" height="50" rx="8" fill={accentFill} stroke={stroke} strokeWidth={sw} />
      <path d="M148 76 L160 87 L182 64" stroke={stroke} strokeWidth={sw + 0.5} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

export function BrowserIllustration({ active }: IllustrationProps) {
  const stroke = active ? "var(--primary)" : "var(--border-strong)";
  const accentFill = active ? "rgba(22,163,74,0.18)" : "var(--tl-illus-fill)";
  const sw = 2;
  return (
    <svg width={210} height={150} viewBox="0 0 210 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={commonStyle(active)}>
      <rect x="14" y="20" width="182" height="110" rx="10" fill={accentFill} stroke={stroke} strokeWidth={sw} />
      <line x1="14" y1="42" x2="196" y2="42" stroke={stroke} strokeWidth={sw} />
      <circle cx="26" cy="31" r="2.6" fill={stroke} />
      <circle cx="36" cy="31" r="2.6" fill={stroke} />
      <circle cx="46" cy="31" r="2.6" fill={stroke} />
      <rect x="58" y="26" width="120" height="11" rx="3" stroke={stroke} strokeWidth={sw} fill="var(--tl-card-bg)" />
      <rect x="28" y="58" width="86" height="8" rx="2" fill={stroke} opacity="0.55" />
      <rect x="28" y="74" width="142" height="6" rx="2" fill={stroke} opacity="0.3" />
      <rect x="28" y="86" width="120" height="6" rx="2" fill={stroke} opacity="0.3" />
      <rect x="28" y="102" width="74" height="18" rx="5" fill={active ? "#16A34A" : stroke} />
    </svg>
  );
}

export function ConnectIllustration({ active }: IllustrationProps) {
  const stroke = active ? "var(--primary)" : "var(--border-strong)";
  const accentFill = active ? "rgba(22,163,74,0.18)" : "var(--tl-illus-fill)";
  const sw = 2;
  return (
    <svg width={210} height={150} viewBox="0 0 210 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={commonStyle(active)}>
      <rect x="14" y="50" width="70" height="52" rx="8" fill="var(--tl-illus-fill)" stroke={stroke} strokeWidth={sw} />
      <text x="49" y="82" textAnchor="middle" fontFamily="Inter, system-ui, sans-serif" fontSize="13" fontWeight="600" fill={stroke}>Ozon</text>
      <line x1="88" y1="76" x2="120" y2="76" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeDasharray="3 4" />
      <path d="M114 70 L122 76 L114 82" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="96" cy="62" r="1.6" fill={stroke} />
      <circle cx="104" cy="62" r="1.6" fill={stroke} />
      <circle cx="112" cy="62" r="1.6" fill={stroke} />
      <rect x="126" y="50" width="70" height="52" rx="8" fill={accentFill} stroke={stroke} strokeWidth={sw} />
      <text x="161" y="82" textAnchor="middle" fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="13" fontWeight="600" fill={stroke}>XML</text>
    </svg>
  );
}

export function CodePickIllustration({ active }: IllustrationProps) {
  const stroke = active ? "var(--primary)" : "var(--border-strong)";
  const accentFill = active ? "rgba(22,163,74,0.18)" : "var(--tl-illus-fill)";
  const sw = 2;
  const rowY = [30, 64, 98];
  return (
    <svg width={210} height={150} viewBox="0 0 210 150" fill="none" xmlns="http://www.w3.org/2000/svg" style={commonStyle(active)}>
      {rowY.map((y, i) => {
        const picked = i === 1;
        return (
          <g key={i}>
            <rect x="14" y={y} width="150" height="26" rx="6"
              fill={picked ? accentFill : "var(--tl-illus-fill)"}
              stroke={picked && active ? "#16A34A" : stroke}
              strokeWidth={picked ? sw + 0.5 : sw}
            />
            <text x="26" y={y + 17} fontFamily="JetBrains Mono, ui-monospace, monospace" fontSize="12" fontWeight="500" fill={picked && active ? "#16A34A" : stroke}>
              {["3304990000", "8517620009", "6109100009"][i]}
            </text>
          </g>
        );
      })}
      <g style={{
        transition: "opacity 500ms ease, transform 500ms ease",
        opacity: active ? 1 : 0,
        transformOrigin: "186px 77px",
        transform: active ? "scale(1)" : "scale(0.5)",
      }}>
        <circle cx="186" cy="77" r="12" fill={active ? "#16A34A" : "transparent"} />
        <path d="M180 77 L184 82 L192 73" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>
    </svg>
  );
}
