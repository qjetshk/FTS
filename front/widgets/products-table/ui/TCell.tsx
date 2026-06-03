import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/ui"
import { cn } from "@/shared/lib"

type Props = {
  value?: string | null
  mono?: boolean
  bold?: boolean
  muted?: boolean
}

export function TCell({ value, mono, bold, muted }: Props) {
  if (!value) return <span className="text-xs text-muted-foreground">—</span>
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger
          render={<span />}
          className={cn("text-xs truncate block cursor-default w-full", mono && "font-mono", bold && "font-semibold", muted && "text-muted-foreground")}
        >
          {value}
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-sm text-xs whitespace-normal">{value}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
