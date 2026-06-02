import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/shared/lib"

function Accordion({ className, ...props }: AccordionPrimitive.Root.Props) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b border-border", className)}
      {...props}
    />
  )
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-center justify-between rounded-lg border border-transparent py-4 text-left text-sm font-medium transition-all outline-none cursor-pointer focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50",
          className
        )}
        {...props}
      >
        {children}
        <span className="relative ml-4 inline-flex shrink-0 size-4 text-muted-foreground">
          <span className="absolute top-1/2 left-0 w-full h-px bg-current -translate-y-1/2 rounded-[1px]" />
          <span className="absolute top-0 left-1/2 w-px h-full bg-current -translate-x-1/2 rounded-[1px] transition-transform duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] group-aria-expanded/accordion-trigger:rotate-90" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({ className, children, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div className={cn("h-(--accordion-panel-height) pb-4 pt-0 data-ending-style:h-0 data-starting-style:h-0", className)}>
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }