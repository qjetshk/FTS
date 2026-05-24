"use client";

import { useRef, useState, useEffect } from "react";
import { useInView } from "framer-motion";

const TRUST_GROUPS = [
  {
    items: [
      { kind: "count" as const, end: 3, display: "2–3", unit: "Минуты", body: "на загрузку готового XML в ЛК ФТС" },
      { kind: "fade" as const, display: "1-го", unit: "Числа каждого месяца", body: "автогенерация без твоего участия" },
    ],
  },
  {
    items: [
      { kind: "fade" as const, display: "1 раз", unit: "Настройка", body: "подключаешь Ozon API — дальше всё работает само", smallNumber: true },
      { kind: "fade" as const, display: "13 289", unit: "Кодов ТН ВЭД", body: "в базе для автоматической классификации товаров", smallNumber: true },
    ],
  },
];

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

function CountUp({ end, finalDisplay, active, duration = 1500 }: { end: number; finalDisplay: string; active: boolean; duration?: number }) {
  const reduce = prefersReducedMotion();
  const [val, setVal] = useState(reduce ? end : 0);
  const [done, setDone] = useState(reduce);

  useEffect(() => {
    if (!active || reduce) return;
    setDone(false); setVal(0);
    let raf: number, start: number | undefined;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);
    const tick = (now: number) => {
      if (start == null) start = now;
      const p = Math.min(1, (now - start) / duration);
      setVal(Math.round(easeOut(p) * end));
      if (p < 1) raf = requestAnimationFrame(tick); else setDone(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, end, duration, reduce]);

  return <>{done ? finalDisplay : val}</>;
}

function FadeInNum({ children, active, delay = 0 }: { children: React.ReactNode; active: boolean; delay?: number }) {
  const reduce = prefersReducedMotion();
  const visible = active || reduce;
  return (
    <span style={{
      display: "inline-block",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(20px)",
      transition: reduce ? "none" : `opacity 700ms var(--ease-out) ${delay}ms, transform 700ms var(--ease-out) ${delay}ms`,
    }}>{children}</span>
  );
}

function TrustStat({ item, active, delay }: { item: typeof TRUST_GROUPS[0]["items"][0]; active: boolean; delay: number }) {
  return (
    <div className={`trust-stat${("smallNumber" in item && item.smallNumber) ? " is-small" : ""}`}>
      <div className="trust-stat-num">
        {item.kind === "count"
          ? <CountUp end={(item as { end: number; display: string }).end} finalDisplay={item.display} active={active} />
          : <FadeInNum active={active} delay={delay}>{item.display}</FadeInNum>
        }
      </div>
      <div style={{ marginTop: 8, font: "600 12px/1 var(--font-sans)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-secondary)" }}>
        {item.unit}
      </div>
      <p style={{ marginTop: 16, marginBottom: 0, font: "400 15px/1.5 var(--font-sans)", color: "var(--text-secondary)", maxWidth: 240 }}>
        {item.body}
      </p>
    </div>
  );
}

export function Trust() {
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef, { once: true, amount: 0.3 });
  const [g1, g2] = TRUST_GROUPS;

  return (
    <section style={{ background: "var(--surface)", padding: "96px 0" }}>
      <div className="container-page" style={{ textAlign: "center" }}>
        <div style={{ font: "600 12px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "1.1px", color: "var(--text-muted)", marginBottom: 16 }}>
          Продукт
        </div>
        <h2 style={{ margin: "0 0 64px", font: "700 44px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--text-primary)" }}>
          Цифры, которые важны
        </h2>
      </div>
      <div className="container-page">
        <div ref={rowRef} className="trust-grid">
          <TrustStat item={g1.items[0]} active={inView} delay={0} />
          <TrustStat item={g1.items[1]} active={inView} delay={80} />
          <div className="trust-divider" aria-hidden="true" />
          <TrustStat item={g2.items[0]} active={inView} delay={160} />
          <TrustStat item={g2.items[1]} active={inView} delay={240} />
        </div>
      </div>
    </section>
  );
}
