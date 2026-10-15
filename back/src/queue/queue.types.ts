// ─── Email ────────────────────────────────────────────────────────────────────

export interface WelcomeJobData { to: string; name: string }
export interface VerifyEmailJobData { to: string; name: string; verifyUrl: string }
export interface ResetPasswordJobData { to: string; name: string; resetUrl: string }

export interface EmailJobMap {
  'welcome': WelcomeJobData;
  'verify-email': VerifyEmailJobData;
  'reset-password': ResetPasswordJobData;
}
export type EmailJobName = keyof EmailJobMap;
export type EmailJobData<T extends EmailJobName> = EmailJobMap[T];

// ─── Statform / Classify ──────────────────────────────────────────────────────

// без API-ключа: данные задач видны в Bull Board и лежат в Redis неделю — ключ читаем из БД в обработчике
export interface StatformJobData {
  organizationId: string;
  ozonClientId: number;
  period: string; // 'YYYY-MM'
  triggeredBy: 'cron' | 'manual';
  // upload — юзер загрузил CSV-отчёт (лежит в Redis, uploadedCsvKey), n8n не ходит в OZON за отчётом
  source?: 'ozon' | 'upload';
}

export interface ClassifyJobData {
  organizationId: string;
  ozonClientId: number;
}
