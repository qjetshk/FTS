import { LogoMark } from "@/components/LogoMark";

export function Footer() {
  return (
    <footer style={{ background: "var(--background)", borderTop: "1px solid var(--border)", padding: "32px 0" }}>
      <div className="container-page" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LogoMark size={22} />
          <span style={{ font: "600 14px/1 var(--font-sans)", color: "var(--text-secondary)" }}>easyfts · 2026</span>
        </div>
        <div style={{ display: "flex", gap: 24, font: "500 13px/1 var(--font-sans)", color: "var(--text-muted)" }}>
          <span style={{ color: "inherit" }}>Условия</span>
          <span style={{ color: "inherit" }}>Конфиденциальность</span>
          <a href="mailto:help@easyfts.ru" style={{ color: "inherit", textDecoration: "none" }}>help@easyfts.ru</a>
        </div>
      </div>
    </footer>
  );
}
