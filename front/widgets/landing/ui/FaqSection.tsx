import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/shared/ui"
import { FAQ_ITEMS } from "../config/landing.data"
import { SectionHeading } from "./SectionHeading"

export function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 bg-background py-20 sm:py-24">
      <SectionHeading title="Частые вопросы" />
      <div className="mx-auto max-w-[760px] px-4 sm:px-6">
        <Accordion>
          {FAQ_ITEMS.map((item, i) => (
            <AccordionItem key={item.q} value={`faq-${i}`}>
              <AccordionTrigger>{item.q}</AccordionTrigger>
              <AccordionContent className="pb-5">
                <p className="text-[15px] leading-relaxed text-text-secondary">{item.a}</p>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        <p className="mt-7 text-center text-sm text-text-secondary">
          Остались вопросы? Напишите в Telegram{" "}
          <a href="https://t.me/thskqje" className="font-semibold text-primary no-underline">
            @thskqje
          </a>
        </p>
      </div>
    </section>
  )
}
