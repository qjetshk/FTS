export function SectionHeading({ title, lead }: { title: string; lead?: string }) {
  return (
    <div className="mx-auto mb-12 max-w-[640px] px-4 text-center sm:mb-16">
      <h2 className="font-display text-[28px] leading-tight font-medium tracking-tight text-balance text-foreground sm:text-[40px]">{title}</h2>
      {lead && <p className="mx-auto mt-4 max-w-[500px] text-[17px] leading-relaxed text-text-secondary">{lead}</p>}
    </div>
  )
}
