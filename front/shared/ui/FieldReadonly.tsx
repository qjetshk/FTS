type Props = {
  label: string
  value: string | null | undefined
}

export function FieldReadonly({ label, value }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="h-9 px-3 flex items-center rounded-md border border-border bg-muted text-sm text-muted-foreground">
        {value || "—"}
      </div>
    </div>
  )
}
