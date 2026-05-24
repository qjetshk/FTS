"use client";

import { useState, useEffect, useRef } from "react";
import { PlugIcon, BuildingIcon, Code2Icon, RefreshCwIcon, FileDownIcon } from "lucide-react";

const STEPS = [
  { n: "01", icon: PlugIcon, title: "Подключите Ozon", body: "Введи Client ID и API ключ один раз в настройках. Доступ только на чтение отгрузок — сервис не может ничего менять в твоём кабинете." },
  { n: "02", icon: BuildingIcon, title: "Заполните данные организации", body: "Основные данные подтягиваем сами — тебе остается только заполнить несколько полей. Далее данные об организации будут подставляться сами." },
  { n: "03", icon: Code2Icon, title: "Сервис подбирает коды ТН ВЭД", body: "Для каждого SKU предлагаем подходящий код по справочнику ФТС. Ты подтверждаешь — и больше к этой рутине не возвращаешься." },
  { n: "04", icon: RefreshCwIcon, title: "Автоматическая генерация 1-го числа", body: "Каждый месяц 1-го числа сервис забирает отгрузки за прошлый месяц из Ozon и собирает XML по XSD-схеме ФТС 5.24.0." },
  { n: "05", icon: FileDownIcon, title: "Скачайте и сдайте", body: "Готовый XML загружаешь в личный кабинет ФТС и подписываешь своей КЭП. Занимает 2–3 минуты." },
];

export function HowItWorks() {
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const blockRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const fn = () => {
      const vh = window.innerHeight;
      const threshold = vh * 0.35;
      let idx = 0;
      for (let i = 0; i < blockRefs.current.length; i++) {
        const el = blockRefs.current[i];
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.top <= threshold) idx = i;
      }
      setActive(idx);
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => { window.removeEventListener("scroll", fn); window.removeEventListener("resize", fn); };
  }, []);

  useEffect(() => {
    const fn = () => {
      const el = sectionRef.current; if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = Math.max(1, r.height - vh);
      const scrolled = -r.top;
      setProgress(Math.max(0, Math.min(1, scrolled / total)));
    };
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    window.addEventListener("resize", fn);
    return () => { window.removeEventListener("scroll", fn); window.removeEventListener("resize", fn); };
  }, []);

  const ActiveIcon = STEPS[active].icon;

  return (
    <section id="how" ref={sectionRef} style={{ background: "var(--background)", padding: "96px 0 0" }}>
      {/* Header */}
      <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ font: "600 11px/1 var(--font-sans)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14 }}>КАК ЭТО РАБОТАЕТ</div>
        <h2 style={{ margin: 0, font: "700 44px/1.1 var(--font-sans)", color: "var(--text-primary)", letterSpacing: "-0.025em" }}>Пять шагов до сданной формы</h2>
        <p style={{ margin: "16px auto 0", maxWidth: 500, font: "400 17px/1.55 var(--font-sans)", color: "var(--text-secondary)" }}>Подключение один раз — дальше всё работает само в фоне.</p>
      </div>

      <div className="container-page" style={{ marginTop: 64, paddingBottom: 96 }}>
        <div className="how-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "start" }}>

          {/* Sticky left panel */}
          <div className="how-sticky" style={{ position: "sticky", top: "calc(50vh - 180px)", height: "fit-content", alignSelf: "start", paddingBottom: 120 }}>
            <div style={{ display: "flex", gap: 28 }}>
              {/* Progress bar */}
              <div style={{ width: 2, background: "var(--border)", borderRadius: 1, position: "relative", flexShrink: 0, alignSelf: "stretch", minHeight: 340 }}>
                <div style={{ position: "absolute", left: 0, top: 0, width: "100%", height: `${progress * 100}%`, background: "var(--primary)", borderRadius: 1, transition: "height 250ms ease" }} />
                {STEPS.map((_, i) => (
                  <div key={i} style={{
                    position: "absolute", left: "50%", top: `${i / (STEPS.length - 1) * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: i === active ? 12 : 8, height: i === active ? 12 : 8,
                    borderRadius: "50%",
                    background: i <= active ? "var(--primary)" : "var(--background)",
                    border: i <= active ? "none" : "2px solid var(--border-strong)",
                    transition: "all 250ms ease",
                  }} />
                ))}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ font: "600 12px/1 var(--font-mono)", color: "var(--primary)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20 }}>
                  Шаг {active + 1} из {STEPS.length}
                </div>
                <div key={`num-${active}`} style={{ font: "700 120px/.9 var(--font-sans)", letterSpacing: "-0.05em", color: "var(--primary)", marginBottom: 16, animation: "numFade 400ms var(--ease-out)" }}>
                  {STEPS[active].n}
                </div>
                <h3 key={`title-${active}`} style={{ margin: "0 0 16px", font: "700 30px/1.15 var(--font-sans)", letterSpacing: "-0.025em", color: "var(--text-primary)", maxWidth: 380, animation: "stepFade 400ms var(--ease-out)" }}>
                  {STEPS[active].title}
                </h3>
                <div key={`icon-${active}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 52, height: 52, borderRadius: "var(--radius-lg)", background: "var(--primary-light)", color: "var(--primary)", animation: "stepFade 400ms var(--ease-out)" }}>
                  <ActiveIcon size={26} />
                </div>
              </div>
            </div>
          </div>

          {/* Scrolling right */}
          <div>
            {STEPS.map((s, i) => (
              <div
                key={i}
                ref={(el) => { blockRefs.current[i] = el; }}
                data-step-idx={i}
                className="how-step-block"
                style={{ minHeight: "70vh", display: "flex", flexDirection: "column", justifyContent: "center", padding: "40px 0" }}
              >
                <div className="how-step-card" style={{
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-xl)",
                  padding: 32,
                  boxShadow: i === active ? "0 8px 28px rgba(15,23,42,.08)" : "var(--shadow-card)",
                  transition: "box-shadow 300ms ease, border-color 300ms ease, transform 300ms ease",
                  borderColor: i === active ? "var(--primary)" : "var(--border)",
                  transform: i === active ? "translateY(-2px)" : "none",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                    <div style={{ width: 36, height: 36, borderRadius: "var(--radius-md)", background: i === active ? "var(--primary)" : "var(--surface-2)", color: i === active ? "#fff" : "var(--text-secondary)", display: "inline-flex", alignItems: "center", justifyContent: "center", font: "700 13px/1 var(--font-mono)", letterSpacing: "-0.02em", transition: "background 300ms ease, color 300ms ease" }}>
                      {s.n}
                    </div>
                    <s.icon size={20} style={{ color: "var(--text-muted)" }} />
                  </div>
                  <h4 style={{ margin: "0 0 10px", font: "600 22px/1.3 var(--font-sans)", letterSpacing: "-0.01em", color: "var(--text-primary)" }}>{s.title}</h4>
                  <p style={{ margin: 0, font: "400 16px/1.6 var(--font-sans)", color: "var(--text-secondary)" }}>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ marginTop: 24, textAlign: "center", font: "400 13px/1.5 var(--font-sans)", color: "var(--text-muted)" }}>
          Генерация занимает пару минут. Уведомление на почту, когда форма готова.
        </p>
      </div>
    </section>
  );
}
