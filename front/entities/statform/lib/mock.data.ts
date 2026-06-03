import type { StatFormRun } from "../model/statform.type"

export const MOCK_RUNS: StatFormRun[] = [
  {
    id: "r1",
    period: "2026-05",
    status: "READY",
    createdAt: "2026-06-01T06:00:00Z",
    completedAt: "2026-06-01T06:03:22Z",
    statForms: [
      { id: "f1", country: "KZ", status: "READY",    itemsCount: 42, completedAt: "2026-06-01T06:03:10Z" },
      { id: "f2", country: "BY", status: "READY",    itemsCount: 17, completedAt: "2026-06-01T06:03:15Z" },
      { id: "f3", country: "AM", status: "FAILED",   itemsCount: 0 },
      { id: "f4", country: "KG", status: "READY",    itemsCount: 8,  completedAt: "2026-06-01T06:03:20Z" },
    ],
  },
  {
    id: "r2",
    period: "2026-04",
    status: "PARTIAL",
    createdAt: "2026-05-01T06:00:00Z",
    completedAt: "2026-05-01T06:02:50Z",
    statForms: [
      { id: "f5", country: "KZ", status: "READY",    itemsCount: 30, completedAt: "2026-05-01T06:02:40Z" },
      { id: "f6", country: "KG", status: "BUILDING", itemsCount: 0 },
    ],
  },
  {
    id: "r3",
    period: "2026-03",
    status: "FAILED",
    createdAt: "2026-04-01T06:00:00Z",
    failureReason: "OZON API недоступен",
    statForms: [],
  },
]
