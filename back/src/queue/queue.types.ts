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

export interface StatformJobData {
  organizationId: string;
  ozonClientId: number;
  ozonApiKey: string;
  period: string; // 'YYYY-MM'
  triggeredBy: 'cron' | 'manual';
}

export interface ClassifyJobData {
  organizationId: string;
  ozonClientId: number;
  ozonApiKey: string;
}
