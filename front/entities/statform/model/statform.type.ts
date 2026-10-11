export type StatFormRunStatus = "PENDING" | "BUILDING" | "READY" | "PARTIAL" | "FAILED" | "NEEDS_REVIEW"
// шаги генерации, пока status = BUILDING
export type StatFormRunStage = "STARTED" | "REQUESTING_REPORT" | "REPORT_RECEIVED" | "FILLING"
export type StatFormStatus = "PENDING" | "READY" | "FAILED" | "BUILDING"

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
  stage: StatFormRunStage | null
  createdAt: string
  completedAt?: string
  failureReason?: string | null
  statForms: StatForm[]
}

export type RunStatformsBody = { period: string }
export type RunStatformsResponse = { queued: true; period: string }
