"use client"

import { toast } from "sonner"
import { Play } from "lucide-react"
import { Button } from "@/shared/ui"
import { useRunStatformsMutation, previousMonth, formatPeriodTitle } from "@/entities/statform"

export function RunStatformsButton() {
  const [run, { isLoading }] = useRunStatformsMutation()

  async function handleClick() {
    const period = previousMonth()
    try {
      await run({ period }).unwrap()
      toast.success(`Генерация за ${formatPeriodTitle(period)} запущена`)
    } catch {
      toast.error("Не удалось запустить генерацию")
    }
  }

  return (
    <Button onClick={handleClick} disabled={isLoading}>
      <Play className="size-4" />
      Сгенерировать статформы
    </Button>
  )
}
