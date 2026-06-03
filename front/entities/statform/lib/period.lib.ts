export function previousMonth(now = new Date()): string {
  const d = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

const MONTHS_RU = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
]

export function formatPeriodTitle(period: string): string {
  const [y, m] = period.split("-").map(Number)
  return `${MONTHS_RU[m - 1]} ${y}`
}
