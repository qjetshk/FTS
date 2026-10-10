// Достаёт message из ошибки RTK Query ({ status, data: { message } }) — Nest кладёт текст туда
export function getApiErrorMessage(error: unknown, fallback: string): string {
  const message = (error as { data?: { message?: unknown } } | undefined)?.data?.message
  if (typeof message === "string") return message
  if (Array.isArray(message) && typeof message[0] === "string") return message[0]
  return fallback
}

// retryAfter (сек) из 429-ответа, если бэк его прислал
export function getApiRetryAfter(error: unknown): number | null {
  const retryAfter = (error as { data?: { retryAfter?: unknown } } | undefined)?.data?.retryAfter
  return typeof retryAfter === "number" ? retryAfter : null
}
