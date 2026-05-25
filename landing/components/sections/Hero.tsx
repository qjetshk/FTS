"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const XML_LINES = [
  [{ c: "tag", t: "<StaticForm>" }],
  [{ c: "tag", t: "  <CustomsProcedure>" }, { c: "val", t: "ЭК" }, { c: "tag", t: "</CustomsProcedure>" }],
  [{ c: "tag", t: "  <ReportingDate>" }, { c: "val", t: "2026-04" }, { c: "tag", t: "</ReportingDate>" }],
  [{ c: "tag", t: "  <TradeCountry>" }],
  [{ c: "tag", t: "    <CountryName>" }, { c: "val", t: "БЕЛАРУСЬ" }, { c: "tag", t: "</CountryName>" }],
  [{ c: "tag", t: "    <CountryCode>" }, { c: "val", t: "BY" }, { c: "tag", t: "</CountryCode>" }],
  [{ c: "tag", t: "  </TradeCountry>" }],
  [{ c: "tag", t: "  <GoodsInfo>" }],
  [{ c: "tag", t: "    <GoodsTNVEDCode>" }, { c: "val", t: "3304990000" }, { c: "tag", t: "</GoodsTNVEDCode>" }],
  [{ c: "tag", t: "    <NetWeightQuantity>" }, { c: "val", t: "0.2" }, { c: "tag", t: "</NetWeightQuantity>" }],
  [{ c: "tag", t: "    <StatisticalCostRUB>" }, { c: "val", t: "1018" }, { c: "tag", t: "</StatisticalCostRUB>" }],
  [{ c: "tag", t: "  </GoodsInfo>" }],
  [{ c: "tag", t: "</StaticForm>" }],
];

const TOTAL_CHARS = XML_LINES.reduce((s, l) => s + l.reduce((a, p) => a + p.t.length, 0), 0);

function Terminal() {
  const [phase, setPhase] = useState<"loading" | "typing" | "done">("loading");
  const [progress, setProgress] = useState(0);
  const [typed, setTyped] = useState(0);
  const cancelRef = useRef<Array<() => void>>([]);

  useEffect(() => {
    setPhase("loading"); setProgress(0); setTyped(0);
    cancelRef.current.forEach((fn) => fn());
    cancelRef.current = [];

    const start = performance.now();
    let raf: number;
    const tickProgress = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setProgress(p);
      if (p < 1) {
        raf = requestAnimationFrame(tickProgress);
      } else {
        setPhase("typing");
        let i = 0;
        const typeStep = () => {
          i++;
          setTyped(i);
          if (i < TOTAL_CHARS) {
            const tid = setTimeout(typeStep, 13);
            cancelRef.current.push(() => clearTimeout(tid));
          } else { setPhase("done"); }
        };
        const tid0 = setTimeout(typeStep, 300);
        cancelRef.current.push(() => clearTimeout(tid0));
      }
    };
    raf = requestAnimationFrame(tickProgress);
    cancelRef.current.push(() => cancelAnimationFrame(raf));
    return () => { cancelRef.current.forEach((fn) => fn()); };
  }, []);

  let rem = typed;
  const rows: React.ReactNode[] = [];
  for (let li = 0; li < XML_LINES.length; li++) {
    if (rem <= 0) break;
    const segs: React.ReactNode[] = [];
    for (let pi = 0; pi < XML_LINES[li].length; pi++) {
      const p = XML_LINES[li][pi];
      if (rem <= 0) break;
      segs.push(
        <span key={pi} style={{ color: p.c === "tag" ? "var(--term-tag)" : "var(--term-value)" }}>
          {p.t.slice(0, rem)}
        </span>
      );
      rem -= p.t.length;
    }
    rows.push(<div key={li}>{segs}</div>);
  }
  if (phase === "typing") {
    rows.push(
      <span key="cur" style={{ display: "inline-block", width: 7, height: 14, background: "#86EFAC", verticalAlign: "-2px", marginLeft: 1, animation: "blink 1s steps(2) infinite" }} />
    );
  }

  return (
    <div style={{ background: "var(--term-bg)", border: "1px solid var(--term-border)", borderRadius: "var(--radius-xl)", overflow: "hidden", boxShadow: "var(--shadow-terminal)" }}>
      {/* Title bar */}
      <div className="term-title flex items-center gap-2 px-4 py-3" style={{ background: "#0A1628", borderBottom: "1px solid var(--term-border)" }}>
        <div className="flex gap-[5px]">
          {["#EF4444", "#F59E0B", "#10B981"].map((c) => (
            <div key={c} className="w-[11px] h-[11px] rounded-full" style={{ background: c }} />
          ))}
        </div>
        <div className="flex-1 text-center text-[12px] font-medium" style={{ color: "var(--term-comment)", fontFamily: "var(--font-sans)" }}>
          easyfts · Генерация статформы BY · апрель 2026
        </div>
        <div className="w-[42px]" />
      </div>

      {/* Status + progress */}
      <div className="px-[18px] pt-[14px]">
        <div className="flex justify-between mb-[7px]">
          <span className="text-[12px] font-semibold flex items-center gap-[6px]" style={{ color: phase === "done" ? "#4ADE80" : "var(--term-comment)" }}>
            {phase === "done" ? (
              <><span style={{ color: "#4ADE80" }}>✓</span> Готово</>
            ) : (
              <><span className="w-2 h-2 rounded-full inline-block" style={{ background: "var(--term-comment)", animation: "pulse-dot 1.2s ease infinite" }} /> Генерация...</>
            )}
          </span>
          <span className="text-[11px] font-medium" style={{ color: "var(--term-comment)", fontFamily: "var(--font-mono)" }}>{Math.round(progress * 100)}%</span>
        </div>
        <div className="h-[3px] rounded-[2px] overflow-hidden" style={{ background: "#1E293B" }}>
          <div style={{ height: "100%", width: `${progress * 100}%`, background: phase === "done" ? "#4ADE80" : "var(--primary)", borderRadius: 2, transition: "background 400ms ease" }} />
        </div>
      </div>

      {/* XML */}
      <pre className="m-0 px-[18px] pt-[14px] pb-[18px] overflow-x-auto" style={{ font: "400 12.5px/1.8 var(--font-mono)", color: "var(--term-value)", whiteSpace: "pre", minHeight: 260 }}>
        {rows}
      </pre>

      {/* Footer */}
      <div className="px-[18px] pt-[10px] pb-[14px] flex justify-between" style={{ borderTop: "1px solid var(--term-border)" }}>
        <span className="text-[11px]" style={{ fontFamily: "var(--font-mono)", color: "var(--term-comment)" }}>XSD схема ФТС 5.24.0</span>
        <span className="text-[11px] font-medium" style={{ fontFamily: "var(--font-mono)", color: "var(--term-comment)" }}>1 позиция · 1 018 ₽</span>
      </div>
    </div>
  );
}

function HeroCta() {
  const handleClick = () => {
    const target = document.getElementById("cta");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => (document.getElementById("cta-email") as HTMLInputElement)?.focus({ preventScroll: true }), 700);
  };

  return (
    <Button size="landing" className="gap-2" onClick={handleClick}>
      Оставить заявку
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 12h14" /><path d="m13 5 7 7-7 7" />
      </svg>
    </Button>
  );
}

export function Hero() {
  const [key, setKey] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setKey((k) => k + 1), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="hero-section flex items-center" style={{ paddingTop: 120, paddingBottom: 160, background: "var(--background)" }}>
      <div className="container-page hero-grid w-full" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 64, alignItems: "center" }}>
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1
            className="hero-h1 mb-5"
            style={{ font: "800 clamp(44px, 4.5vw, 64px)/1.04 var(--font-sans)", letterSpacing: "-0.03em", color: "var(--text-primary)" }}
          >
            Статформы ФТС<br />
            <span style={{ fontWeight: 500, color: "var(--text-secondary)" }}>
              <span className="hero-long">для Озон-селлеров — без ручного заполнения</span>
              <span className="hero-short hidden">для Озон-селлеров</span>
            </span>
          </h1>

          <p className="mb-9" style={{ font: "400 18px/1.6 var(--font-sans)", color: "var(--text-secondary)", maxWidth: "36ch" }}>
            Подключаешь Ozon API один раз — и каждое 1-е число статформа для ФТС готова. Без 1С, работает на УСН и НПД.
          </p>

          <HeroCta />

          <p className="mt-3 text-[13px] leading-[1.5]" style={{ color: "var(--text-muted)" }}>
            без карты · скидка 50% для ранних · без спама
          </p>
        </motion.div>

        <motion.div
          className="hero-terminal-wrap relative"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <Terminal key={key} />
          <p className="mt-[10px] text-center text-[12px] leading-[1.5]" style={{ color: "var(--text-muted)" }}>
            XML по схеме ФТС 5.24.0
          </p>
        </motion.div>
      </div>
    </section>
  );
}
