export function InterCTA() {
  return (
    <section style={{ background: "var(--background)", padding: "0 0 80px", textAlign: "center" }}>
      <div className="container-page">
        <a
          href="#cta"
          className="inline-flex items-center gap-2 no-underline font-semibold text-base px-7 py-4 rounded-xl"
          style={{
            background: "var(--primary)",
            color: "#fff",
            boxShadow: "0 4px 14px rgba(22,163,74,.30)",
          }}
        >
          Оставить заявку
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
          </svg>
        </a>
        <p style={{ marginTop: 10, font: "400 13px/1.5 var(--font-sans)", color: "var(--text-muted)" }}>
          без карты · скидка 50% для ранних
        </p>
      </div>
    </section>
  );
}