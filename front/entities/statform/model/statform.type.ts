export type StatFormRunStatus = "BUILDING" | "READY" | "PARTIAL" | "FAILED"
export type StatFormStatus = "READY" | "FAILED" | "BUILDING"

export type StatForm = {
  id: string
  country: string
  status: StatFormStatus
  itemsCount: number
  completedAt?: string
}

export type StatFormRun = {
  id: string
  period: string
  status: StatFormRunStatus
  createdAt: string
  completedAt?: string
  failureReason?: string
  statForms: StatForm[]
}

export type RunStatformsBody = { period: string }
export type RunStatformsResponse = { queued: true; period: string }
