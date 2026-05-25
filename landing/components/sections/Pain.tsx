"use client";

import { useRef, useState, useEffect } from "react";
import { EditorIllustration, OneCIllustration, TransferIllustration, CodesIllustration } from "@/components/illustrations/PainIllustrations";

const PAIN = [
  { n: "01", title: "Редактор ФТС не для людей", body: "Одна позиция — одна форма вручную. Если у тебя 20 SKU и пара стран ЕАЭС, это часы монотонной работы. Каждый месяц.", illo: "editor" },
  { n: "02", title: "1С — не вариант для большинства", body: "Расширения для 1С закрывают задачу, только если весь учёт уже в 1С. Мелкие и средние Ozon-селлеры в ней не сидят — держать 1С ради статформы раз в месяц бессмысленно.", illo: "one-c" },
  { n: "03", title: "Каждый месяц — руки в таблицах вместо продаж", body: "Выгружаешь отчёты, копируешь артикулы, сверяешь страны вручную — и так до 10-го числа каждый месяц. Ошибся или пропустил строку — начинай заново.", illo: "transfer" },
  { n: "04", title: "Коды ТН ВЭД — не угадаешь", body: "Ошибёшься в коде — форму отклонят, придётся переделывать. У косметики, электроники и текстиля разные коды, и это не очевидно.", illo: "codes" },
];

function PainIllustration({ kind, active }: { kind: string; active: boolean }) {
  if (kind === "editor") return <EditorIllustration active={active} />;
  if (kind === "one-c") return <OneCIllustration active={active} />;
  if (kind === "transfer") return <TransferIllustration active={active} />;
  if (kind === "codes") return <CodesIllustration active={active} />;
  return null;
}

function PainRow({ item, leftSide }: { item: typeof PAIN[0]; leftSide: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current; if (!el) return;
    if (!("IntersectionObserver" in window)) { setActive(true); return; }
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => setActive(e.isIntersecting)),
      { rootMargin: "-25% 0px -25% 0px", threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const d = (ms: number) => active ? `${ms}ms` : "0ms";

  const Card = (
    <div
      className="pain-tl-card"
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
      </div>
      <h3 style={{ margin: "18px 0 0", font: "600 22px/1.25 var(--font-sans)", color: "var(--text-primary)" }}>{item.title}</h3>
      <p style={{ margin: "10px 0 0", font: "400 16px/1.6 var(--font-sans)", color: "var(--text-secondary)", maxWidth: "42ch" }}>{item.body}</p>
    </div>
  );

  const Illo = (
    <div className="pain-tl-illo" style={{ display: "flex", justifyContent: "center" }}>
      <PainIllustration kind={item.illo} active={active} />
    </div>
  );

  return (
    <div
      ref={ref}
      className={`pain-tl-row ${leftSide ? "row-left" : "row-right"}`}
      style={{ display: "grid", gridTemplateColumns: "1fr 40px 1fr", alignItems: "center", minHeight: "50vh", opacity: active ? 1 : 0.4, transition: "opacity 450ms ease" }}
    >
      <div style={{ display: "flex", justifyContent: leftSide ? "flex-end" : "center", paddingRight: leftSide ? 24 : 0 }}>
        {leftSide ? Card : Illo}
      </div>

      <div className="pain-tl-center" style={{ position: "relative", alignSelf: "stretch", display: "flex", justifyContent: "center" }}>
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, background: "var(--border)", transform: "translateX(-50%)" }} />
        <div style={{ position: "relative", alignSelf: "center", width: 16, height: 16, borderRadius: "50%", background: active ? "var(--primary)" : "var(--tl-card-bg)", border: `2px solid ${active ? "var(--primary)" : "var(--border-strong)"}`, boxShadow: active ? "0 0 0 6px rgba(22,163,74,0.10)" : "0 0 0 0 rgba(22,163,74,0)", transform: active ? "scale(1.15)" : "scale(1)", transition: `all 450ms ease ${d(0)}` }} />
      </div>

      <div style={{ display: "flex", justifyContent: leftSide ? "center" : "flex-end", paddingRight: leftSide ? 0 : 24 }}>
        {leftSide ? Illo : Card}
      </div>
    </div>
  );
}

export function Pain() {
  return (
    <section style={{ background: "var(--surface)", padding: "96px 0" }}>
      <div className="container-page" style={{ textAlign: "center" }}>
        <div style={{ font: "600 11px/1 var(--font-sans)", textTransform: "uppercase", letterSpacing: "1.1px", color: "var(--text-muted)", marginBottom: 16 }}>
          Так сейчас
        </div>
        <h2 style={{ margin: "0 0 64px", font: "700 44px/1.1 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--text-primary)" }}>
          Статформа Озон: каждый месяц — одно и то же
        </h2>
      </div>
      <div className="container-page" style={{ maxWidth: 1100 }}>
        {PAIN.map((item, i) => (
          <PainRow key={item.title} item={item} leftSide={i % 2 === 0} />
        ))}
      </div>
    </section>
  );
}
