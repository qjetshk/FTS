import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#0A1628",
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo row */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 48 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: "#16A34A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <polyline points="14 2 14 8 20 8" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="16" y1="13" x2="8" y2="13" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <line x1="16" y1="17" x2="8" y2="17" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
              <polyline points="10 9 9 9 8 9" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontSize: 28, fontWeight: 700, color: "#F8FAFC", letterSpacing: "-0.02em" }}>
            easyfts
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            color: "#F8FAFC",
            lineHeight: 1.05,
            letterSpacing: "-0.03em",
            marginBottom: 28,
            maxWidth: 900,
          }}
        >
          Статформы ФТС для Ozon-селлеров — автоматом
        </div>

        {/* Subline */}
        <div style={{ fontSize: 28, color: "#94A3B8", fontWeight: 400, maxWidth: 780 }}>
          Каждый месяц 1-го числа — готовый XML по схеме ФТС 5.24.0
        </div>

        {/* Bottom badge */}
        <div
          style={{
            position: "absolute",
            bottom: 64,
            right: 80,
            background: "#16A34A",
            borderRadius: 10,
            padding: "12px 24px",
            fontSize: 20,
            fontWeight: 700,
            color: "#fff",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          easyfts.ru
        </div>
      </div>
    ),
    size
  );
}