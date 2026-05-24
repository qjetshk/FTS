"use client";

import { useRef, useState, useEffect } from "react";
import { CheckIcon } from "lucide-react";
import { BatchIllustration, BrowserIllustration, ConnectIllustration, CodePickIllustration } from "@/components/illustrations/SolutionIllustrations";

const SOLUTION = [
  { n: "01", title: "Массовая генерация вместо ручной формы", body: "Все позиции и страны обрабатываются разом. Где раньше уходили часы на форму за формой — теперь один прогон.", illo: "batch" },
  { n: "02", title: "Никакой 1С — всё в браузере", body: "Не нужно ставить и держать программу учёта. Открыл сайт, нажал — форма готова. Работает с любой системой налогообложения.", illo: "browser" },
  { n: "03", title: "Подключил Ozon — данные сами в форме", body: "Один раз вводишь Client ID и API-ключ. Дальше отгрузки, артикулы и страны подтягиваются автоматически — без выгрузок и копирования.", illo: "connect" },
  { n: "04", title: "Коды ТН ВЭД подбираем за тебя", body: "Сервис сам классифицирует товары и предлагает код по справочнику ФТС. Сомнительные помечает отдельно — ты проверяешь только спорные позиции.", illo: "code-pick" },
];

function SolutionIllustration({ kind, active }: { kind: string; active: boolean }) {
  if (kind === "batch") return <BatchIllustration active={active} />;
  if (kind === "browser") return <BrowserIllustration active={active} />;
  if (kind === "connect") return <ConnectIllustration active={active} />;
  if (kind === "code-pick") return <CodePickIllustration active={active} />;
  return null;
}

function SolutionRow({ item, leftSide }: { item: typeof SOLUTION[0]; leftSide: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setActive(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setActive(e.isIntersecting)),
      { rootMargin: "-30% 0px -30% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const d = (ms: number) => active ? `${ms}ms` : "0ms";

  const Card = (
    <div
      className="sol-tl-card"
      style={{
        maxWidth: 600, background: "var(--tl-card-bg)",
        border: `1px solid ${active ? "var(--primary)" : "var(--border)"}`,
        borderRadius: 16, padding: "28px 32px",
        boxShadow: active ? "0 0 0 1px #16A34A, 0 0 40px -10px rgba(22,163,74,0.4)" : "0 1px 2px rgba(15,23,42,0.04)",
        transition: `border-color 450ms ease ${d(100)}, box-shadow 450ms ease ${d(100)}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#16A34A", color: "#FFFFFF", display: "inline-flex", alignItems: "center", justifyContent: "center", font: "600 13px/1 var(--font-mono)", letterSpacing: "-0.02em" }}>{item.n}</div>
        <span style={{
          marginLeft: "auto", display: "inline-flex", alignItems: "center", justifyContent: "center",
          width: 22, height: 22, color: "#16A34A",
          opacity: active ? 1 : 0, transform: active ? "scale(1)" : "scale(0.6)",
          transition: `opacity 400ms ease ${d(200)}, transform 400ms ease ${d(200)}`,
        }}>
          <CheckIcon size={18} />
        </span>
      </div>
      <h3 style={{ margin: "18px 0 0", font: "600 22px/1.25 var(--font-sans)", color: "var(--text-primary)" }}>{item.title}</h3>
      <p style={{ margin: "10px 0 0", font: "400 16px/1.6 var(--font-sans)", color: "var(--text-secondary)", maxWidth: "42ch" }}>{item.body}</p>
    </div>
  );

  const Illo = (
    <div className="sol-tl-illo" style={{ display: "flex", justifyContent: "center" }}>
      <SolutionIllustration kind={item.illo} active={active} />
    </div>
  );

  return (
    <div
      ref={ref}
      className={`sol-tl-row ${leftSide ? "row-left" : "row-right"}`}
      style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", alignItems: "center", minHeight: "50vh", opacity: active ? 1 : 0.4, transition: "opacity 450ms ease" }}
    >
      <div style={{ display: "flex", justifyContent: leftSide ? "flex-end" : "center", paddingRight: leftSide ? 24 : 0 }}>
        {leftSide ? Card : Illo}
      </div>
      <div className="sol-tl-center" style={{ position: "relative", alignSelf: "stretch", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "var(--border)", transform: "translateX(-50%)" }} />
        <div style={{ position: "relative", alignSelf: "center", width: 16, height: 16, borderRadius: "50%", background: active ? "var(--primary)" : "var(--tl-card-bg)", border: `2px solid ${active ? "var(--primary)" : "var(--border-strong)"}`, boxShadow: active ? "0 0 0 6px rgba(22,163,74,0.10)" : "0 0 0 0 rgba(22,163,74,0)", transform: active ? "scale(1.15)" : "scale(1)", transition: `all 450ms ease ${d(0)}` }} />
      </div>
      <div style={{ display: "flex", justifyContent: leftSide ? "center" : "flex-end", paddingRight: leftSide ? 0 : 24 }}>
        {leftSide ? Illo : Card}
      </div>
    </div>
  );
}

export function Solution() {
  return (
    <section style={{ background: "var(--background)", padding: "96px 0" }}>
      <div className="container-page" style={{ textAlign: "center" }}>
        <div style={{ font: "600 11px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "1.1px", color: "var(--text-muted)", marginBottom: 16 }}>
          Что меняется
        </div>
        <h2 style={{ margin: "0 0 48px", font: "700 44px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--text-primary)" }}>
          Те же задачи — без ручной работы
        </h2>
      </div>
      <div className="container-page" style={{ maxWidth: 1100 }}>
        {SOLUTION.map((item, i) => (
          <SolutionRow key={item.title} item={item} leftSide={i % 2 === 0} />
        ))}
      </div>
    </section>
  );
}
