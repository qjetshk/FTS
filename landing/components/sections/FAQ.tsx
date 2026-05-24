"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { FAQ_ITEMS } from "@/lib/faq-data";

export function FAQ() {
  return (
    <section id="faq" className="py-24" style={{ background: "var(--surface)" }}>
      <div style={{ textAlign: "center", maxWidth: 620, margin: "0 auto", padding: "0 24px" }}>
        <div style={{ font: "600 11px/1 var(--font-sans)", letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 14 }}>FAQ</div>
        <h2 style={{ margin: 0, font: "700 44px/1.1 var(--font-sans)", color: "var(--text-primary)", letterSpacing: "-0.025em" }}>Частые вопросы</h2>
      </div>

      <motion.div
        style={{ maxWidth: 760, margin: "48px auto 0", padding: "0 24px" }}
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <Accordion>
          {FAQ_ITEMS.map((it, i) => (
            <AccordionItem key={it.q} value={`faq-${i}`}>
              <AccordionTrigger>{it.q}</AccordionTrigger>
              <AccordionContent className="pb-5">
                <p className="text-[15px] leading-[1.6] max-w-[700px]" style={{ color: "var(--text-secondary)" }}>{it.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <p className="mt-7 text-sm leading-[1.5] text-center" style={{ color: "var(--text-secondary)" }}>
          Остались вопросы? Напиши в Telegram{" "}
          <a href="https://t.me/thskqje" className="font-semibold no-underline" style={{ color: "var(--primary)" }}>@thskqje</a>
          {" "}— отвечу лично.
        </p>
      </motion.div>
    </section>
  );
}
