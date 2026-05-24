"use client";

import { useState, useEffect } from "react";
import { CheckCircle2Icon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, formatPrice, type Plan } from "@/lib/plans";

// ─── Toast ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error";

interface ToastState {
  id: number;
  message: string;
  type: ToastType;
}

function Toast({ toast, onClose }: { toast: ToastState; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4500);
    return () => clearTimeout(t);
  }, [onClose]);

  const ok = toast.type === "success";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.96 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-5 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-4 py-3 rounded-[var(--radius-lg)] min-w-[280px] max-w-[480px] w-max"
      style={{
        background: "var(--background)",
        border: `1.5px solid ${ok ? "var(--primary)" : "#ef4444"}`,
        boxShadow: ok
          ? "0 8px 32px rgba(22,163,74,.18)"
          : "0 8px 32px rgba(239,68,68,.18)",
      }}
    >
      {ok ? (
        <CheckCircle2Icon size={18} style={{ color: "var(--primary)", flexShrink: 0 }} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="m9 9 6 6" />
        </svg>
      )}
      <span className="text-[14px] font-medium leading-[1.4]" style={{ color: "var(--text-primary)" }}>
        {toast.message}
      </span>
      <button
        onClick={onClose}
        className="ml-2 bg-transparent border-0 p-0 cursor-pointer transition-opacity opacity-40 hover:opacity-80"
        style={{ color: "var(--text-secondary)", lineHeight: 0 }}
        aria-label="Закрыть"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
          <path d="m18 6-12 12" /><path d="m6 6 12 12" />
        </svg>
      </button>
    </motion.div>
  );
}

// ─── Plan option card ─────────────────────────────────────────────────────────

function PlanOption({
  plan,
  billing,
  selected,
  onSelect,
}: {
  plan: Plan;
  billing: "month" | "year";
  selected: boolean;
  onSelect: () => void;
}) {
  const price = billing === "year" ? plan.yearlyPrice : plan.monthlyPrice;
  const period = billing === "year" ? "/ год" : "/ мес";

  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className="relative flex flex-col items-start text-left p-4 rounded-[var(--radius-lg)] transition-all duration-200 cursor-pointer border-0 focus-visible:outline-2 focus-visible:outline-offset-2"
      style={{
        flex: "1 1 0",
        background: selected ? "var(--primary-light)" : "var(--background)",
        border: selected
          ? "1.5px solid var(--primary)"
          : "1px solid var(--border)",
        outlineColor: "var(--primary)",
      }}
    >
      {plan.featured && (
        <Badge className="absolute -top-[11px] right-3 h-auto px-[8px] py-[4px] text-[10px] tracking-[0.06em] uppercase font-semibold">
          Оптимальный выбор
        </Badge>
      )}

      {/* Radio indicator */}
      <span
        className="absolute top-3.5 right-3.5 flex h-[18px] w-[18px] items-center justify-center rounded-full transition-all duration-200"
        style={{
          border: selected ? "2px solid var(--primary)" : "1.5px solid var(--border)",
        }}
      >
        {selected && (
          <span
            className="block h-2.5 w-2.5 rounded-full"
            style={{ background: "var(--primary)" }}
          />
        )}
      </span>

      <span className="text-[14px] font-semibold pr-7 mb-0.5" style={{ color: "var(--text-primary)" }}>
        {plan.name}
      </span>
      <span className="text-[12px] mb-3 leading-[1.4]" style={{ color: "var(--text-secondary)" }}>
        {plan.blurb}
      </span>
      <span
        className="text-[20px] font-bold leading-none tracking-tight"
        style={{ color: selected ? "var(--primary)" : "var(--text-primary)" }}
      >
        {formatPrice(price)}
      </span>
      <span className="text-[11px] mt-1" style={{ color: "var(--text-muted)" }}>
        {period}
      </span>
    </button>
  );
}

// ─── CTA section ──────────────────────────────────────────────────────────────

export function CTA() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [billing, setBilling] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<Plan>(PLANS[1]);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    const fn = (e: Event) => {
      const detail = (e as CustomEvent).detail as { plan: string; billing: string };
      const found = PLANS.find((p) => p.name === detail.plan);
      if (found) setSelectedPlan(found);
      setBilling(detail.billing === "year" ? "year" : "month");
    };
    window.addEventListener("easyfts:select-plan", fn);
    return () => window.removeEventListener("easyfts:select-plan", fn);
  }, []);

  const showToast = (message: string, type: ToastType) => {
    setToast({ id: Date.now(), message, type });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const price = billing === "year" ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
    const period = billing === "year" ? "год" : "мес";

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, plan: selectedPlan.name, period, price }),
      });

      if (res.ok) {
        setSent(true);
        showToast("Ты в списке! Напишем, как только запустимся.", "success");
      } else {
        showToast("Что-то пошло не так. Попробуй ещё раз.", "error");
      }
    } catch {
      showToast("Нет соединения. Проверь интернет и попробуй снова.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {toast && (
          <Toast key={toast.id} toast={toast} onClose={() => setToast(null)} />
        )}
      </AnimatePresence>

      <section id="cta" className="py-24" style={{ background: "var(--background)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 24px" }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-center rounded-3xl px-8 py-14"
            style={{ background: "var(--surface)", boxShadow: "0 1px 2px rgba(15,23,42,0.04)" }}
          >
            <h2
              className="m-0 mb-4 text-[44px] font-bold leading-[1.1] tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              Получи ранний доступ
            </h2>
            <p
              style={{
                margin: "0 auto 36px",
                maxWidth: 520,
                font: "400 17px/1.6 var(--font-sans)",
                color: "var(--text-secondary)",
              }}
            >
              easyfts запускается скоро. Оставь email&nbsp;— пригласим в&nbsp;первую волну и&nbsp;закрепим за&nbsp;тобой скидку{" "}
              <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>
                50% на первый период
              </strong>
              .
            </p>

            {sent ? (
              <div
                className="inline-flex items-center gap-2.5 text-[15px] font-medium leading-normal"
                style={{ color: "var(--text-primary)" }}
              >
                <CheckCircle2Icon size={18} style={{ color: "var(--primary)" }} />
                Ты в списке. Напишем на {email || "указанную почту"}&nbsp;— как только запустимся.
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Period toggle */}
                <div className="flex justify-center mb-5">
                  <div
                    className="inline-flex p-1 rounded-full"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
                  >
                    {(["month", "year"] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setBilling(b)}
                        className="inline-flex items-center gap-2 px-[18px] py-[9px] rounded-full text-[13px] font-semibold border-0 cursor-pointer transition-all duration-200"
                        style={{
                          background: billing === b ? "var(--background)" : "transparent",
                          color: billing === b ? "var(--text-primary)" : "var(--text-secondary)",
                          boxShadow: billing === b ? "var(--shadow-card)" : "none",
                        }}
                      >
                        {b === "month" ? (
                          "Месяц"
                        ) : (
                          <>
                            Год
                            <span
                              className="text-[11px] font-semibold px-1.5 py-[3px] rounded-[var(--radius-sm)] transition-all duration-200"
                              style={{
                                color: billing === "year" ? "var(--primary)" : "var(--text-muted)",
                                background: billing === "year" ? "var(--primary-light)" : "transparent",
                              }}
                            >
                              −17%
                            </span>
                          </>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Plan selector */}
                <div
                  role="radiogroup"
                  aria-label="Выбор тарифа"
                  className="flex gap-3 mb-6 max-[560px]:flex-col"
                >
                  {PLANS.map((plan) => (
                    <PlanOption
                      key={plan.name}
                      plan={plan}
                      billing={billing}
                      selected={selectedPlan.name === plan.name}
                      onSelect={() => setSelectedPlan(plan)}
                    />
                  ))}
                </div>

                {/* Email + submit */}
                <div className="cta-form-row flex gap-2 mx-auto" style={{ maxWidth: 520 }}>
                  <div className="flex-1 min-w-0">
                    <Input
                      id="cta-email"
                      type="email"
                      required
                      placeholder="ваш@email.ru"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="border-border rounded-[10px] text-[15px] bg-background"
                      style={{ height: 52, paddingLeft: 18, paddingRight: 18 }}
                    />
                  </div>
                  <Button
                    type="submit"
                    size="landing"
                    disabled={loading}
                    className="shrink-0 gap-2"
                    style={{ height: 52, paddingLeft: 28, paddingRight: 28 }}
                  >
                    {loading ? (
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        className="animate-spin"
                        aria-hidden="true"
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                    ) : (
                      <>
                        Оставить заявку
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 5 7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </Button>
                </div>

                <p
                  className="mt-4 text-[13px] leading-normal inline-flex items-center gap-1.5"
                  style={{ color: "var(--text-muted)" }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="shrink-0"
                  >
                    <rect x="4" y="11" width="16" height="10" rx="2" />
                    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
                  </svg>
                  Без спама. Скидка 50% закрепляется навсегда после запуска.
                </p>

                <p className="mt-5 text-[13px] leading-normal" style={{ color: "var(--text-secondary)" }}>
                  Есть вопрос?{" "}
                  <a
                    href="https://t.me/thskqje"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold no-underline"
                    style={{ color: "var(--primary)" }}
                  >
                    Написать в Telegram
                  </a>
                  {" "}— отвечу лично.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </>
  );
}
