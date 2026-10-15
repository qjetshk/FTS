import { StartLink } from "./StartLink"

export function FinalCta({ authed }: { authed: boolean }) {
  return (
    <section className="bg-surface py-20 sm:py-24">
      <div className="mx-auto flex max-w-[640px] flex-col items-center px-4 text-center">
        <h2 className="font-display text-[28px] leading-tight font-medium tracking-tight text-balance text-foreground sm:text-[38px]">
          Следующая статформа соберётся сама
        </h2>
        <p className="mt-4 mb-8 text-[17px] leading-relaxed text-text-secondary">
          Подключите Ozon сейчас — к 1-му числу всё будет готово.
        </p>
        <StartLink authed={authed} />
      </div>
    </section>
  )
}
