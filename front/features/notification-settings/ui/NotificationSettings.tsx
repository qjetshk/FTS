"use client"

import { useState } from "react"

type Toggle = { id: string; label: string; description: string; disabled?: boolean }

const TOGGLES: Toggle[] = [
  {
    id: "classification_done",
    label: "Классификация завершена",
    description: "Email когда все товары организации получили ТН ВЭД код",
  },
  {
    id: "statform_ready",
    label: "Статформа готова",
    description: "Email когда XML-файл статформы сформирован и готов к скачиванию",
  },
  {
    id: "push",
    label: "Push-уведомления",
    description: "Браузерные уведомления — скоро",
    disabled: true,
  },
]

export function NotificationSettings() {
  const [values, setValues] = useState<Record<string, boolean>>({
    classification_done: true,
    statform_ready: true,
    push: false,
  })

  const toggle = (id: string) => {
    setValues((prev) => ({ ...prev, [id]: !prev[id] }))
    // TODO: persist to backend when notification preferences endpoint is ready
  }

  return (
    <div className="flex flex-col gap-3">
      {TOGGLES.map((t) => (
        <div key={t.id} className="flex items-center justify-between gap-4 py-1">
          <div className="flex flex-col gap-0.5">
            <span className={`text-sm font-medium ${t.disabled ? "text-muted-foreground" : ""}`}>
              {t.label}
            </span>
            <span className="text-xs text-muted-foreground">{t.description}</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={values[t.id]}
            disabled={t.disabled}
            onClick={() => !t.disabled && toggle(t.id)}
            className={[
              "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-40",
              values[t.id] ? "bg-primary" : "bg-input",
            ].join(" ")}
          >
            <span
              className={[
                "pointer-events-none block size-4 rounded-full bg-background shadow-lg ring-0 transition-transform duration-200",
                values[t.id] ? "translate-x-4" : "translate-x-0",
              ].join(" ")}
            />
          </button>
        </div>
      ))}
      <p className="text-xs text-muted-foreground pt-1">
        Настройки уведомлений сохранятся после подключения email-сервиса
      </p>
    </div>
  )
}
