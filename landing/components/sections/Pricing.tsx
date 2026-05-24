"use client";

import { useState } from "react";
import { CheckIcon, HelpCircleIcon } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, formatPrice, type Plan } from "@/lib/plans";

function PriceCard({
  plan,
  billing,
  delay,
}: {
  plan: Plan;
  billing: "month" | "year";
  delay: number;
}) {
  const price = formatPrice(billing === "year" ? plan.yearlyPrice : plan.monthlyPrice);
  const period = billing === "year" ? "/ год" : "/ мес";

  const handleCta = () => {
    window.dispatchEvent(new CustomEvent("easyfts:select-plan", { detail: { plan: plan.name, billing } }));
    const target = document.getElementById("cta");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
    setTimeout(() => (document.getElementById("cta-email") as HTMLInputElement)?.focus({ preventScroll: true }), 700);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.16, 1, 0.3, 1] }}
      className="flex-1 relative flex flex-col p-7 rounded-[var(--radius-lg)]"
      style={{
        background: "var(--background)",
        border: plan.featured ? "1.5px solid var(--primary)" : "1px solid var(--border)",
        boxShadow: plan.featured ? "0 8px 28px rgba(22,163,74,.12)" : "var(--shadow-card)",
      }}
    >
      {plan.featured && (
        <Badge className="absolute -top-3 left-6 h-auto px-[10px] py-[6px] text-[11px] tracking-[0.06em] uppercase font-semibold">
          Оптимальный выбор
        </Badge>
      )}
      <h3 className="m-0 mb-1.5 text-[20px] font-semibold leading-[1.3]" style={{ color: "var(--text-primary)" }}>
        {plan.name}
      </h3>
      <p className="m-0 mb-[22px] text-sm leading-[1.5]" style={{ color: "var(--text-secondary)" }}>
        {plan.blurb}
      </p>
      <div className="flex items-baseline gap-[5px] mb-[26px] min-h-[42px]">
        <span
          key={`p-${billing}`}
          className="text-[34px] font-bold leading-none tracking-[-0.02em]"
          style={{ color: "var(--text-primary)", animation: "priceFade 200ms ease" }}
        >
          {price}
        </span>
        <span
          key={`pp-${billing}`}
          className="text-sm font-medium leading-none"
          style={{ color: "var(--text-muted)", animation: "priceFade 200ms ease" }}
        >
          {period}
        </span>
      </div>
      <ul className="list-none p-0 m-0 mb-7 flex flex-col gap-[10px]">
        {plan.features.map((f) => (
          <li key={f} className="flex items-start gap-[10px] text-sm leading-[1.5]" style={{ color: "var(--text-primary)" }}>
            <CheckIcon size={16} className="shrink-0 mt-[2px]" style={{ color: "var(--primary)" }} />
            {f}
          </li>
        ))}
      </ul>
      <Button
        onClick={handleCta}
        variant={plan.featured ? "default" : "outline"}
        size="landing"
        className="mt-auto w-full justify-center"
      >
        Хочу этот тариф
      </Button>
    </motion.div>
  );
}

export function Pricing() {
  const [billing, setBilling] = useState<"month" | "year">("month");

  return (
    <section id="pricing" className="py-24" style={{ background: "var(--background)" }}>
      <div className="text-center max-w-[620px] mx-auto px-6">
        <div className="text-[11px] font-semibold tracking-[0.1em] uppercase mb-[14px]" style={{ color: "var(--text-muted)" }}>
          ТАРИФЫ
        </div>
        <h2 className="m-0 text-[44px] font-bold leading-[1.1] tracking-[-0.025em]" style={{ color: "var(--text-primary)" }}>
          Подписка под объём твоего каталога
        </h2>
        <p className="mt-4 mx-auto max-w-[500px] text-[17px] leading-[1.55]" style={{ color: "var(--text-secondary)" }}>
          7 дней бесплатно — без карты
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex justify-center mt-8">
        <div
          className="inline-flex p-1 rounded-full"
          style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
        >
          {(["month", "year"] as const).map((b) => (
            <button
              key={b}
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

      <div className="container-page" style={{ marginTop: 56 }}>
        <div className="flex gap-5 justify-center items-stretch pricing-row">
          {PLANS.map((p, i) => (
            <PriceCard key={p.name} plan={p} billing={billing} delay={i * 80} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-[720px] mx-auto mt-12 flex gap-[14px] items-start p-[18px] rounded-[var(--radius-lg)]"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="w-9 h-9 rounded-[var(--radius-md)] inline-flex items-center justify-center shrink-0"
            style={{ background: "var(--primary-light)", color: "var(--primary)" }}
          >
            <HelpCircleIcon size={20} />
          </div>
          <p className="m-0 text-sm leading-[1.6]" style={{ color: "var(--text-secondary)" }}>
            <strong className="font-semibold" style={{ color: "var(--text-primary)" }}>Не знаете, сколько у вас SKU?</strong>{" "}
            После подключения магазина сервис посчитает уникальные товары и сам предложит подходящий тариф. Каталог вырос — переход на следующий тариф в один клик.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
