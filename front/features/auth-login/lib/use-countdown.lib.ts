import { useEffect, useState } from "react"

// Обратный отсчёт в секундах: start(n) запускает, seconds === 0 — можно действовать
export function useCountdown() {
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    if (seconds <= 0) return
    const id = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds])

  return { seconds, start: setSeconds }
}
