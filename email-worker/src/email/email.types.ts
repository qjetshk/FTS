export const EMAIL_QUEUE = 'email';

// Поля, которые бэк кладёт в каждое уведомление (NotificationService)
type NotificationBase = {
  to: string;
  name: string | null;
  orgName: string;
  actionUrl: string;
};

export type ReviewProduct = { sku: string; name: string };

// = STATFORM_FAIL_CAUSES на бэке
export type StatformFailCause = 'rate_unavailable' | 'ozon_auth';

// = OnboardingStage на бэке (src/auth/auth.service.ts)
export type OnboardingStage = 'no_org' | 'setup' | 'no_runs' | 'has_runs';

// Имя задачи в очереди = имя события на бэке (src/notification/notification.events.ts)
export type EmailJobMap = {
  'welcome': { to: string };
  // в задаче только userId; остальное воркер дописывает в момент отправки (prepare в email.templates.ts)
  'onboarding.check-in': {
    to: string;
    userId: string;
    name?: string | null;
    stage?: OnboardingStage;
    actionUrl?: string;
  };
  'login-code': { to: string; code: string };
  'statform.ready': NotificationBase & { period: string; countries: string[]; statformIds: string[]; partial: boolean };
  'statform.failed': NotificationBase & { period: string; cause?: StatformFailCause; reason?: string };
  'statform.no-sales': NotificationBase & { period: string };
  'products.need-review': NotificationBase & { period: string; products: ReviewProduct[] };
  'ozon.api-error': NotificationBase & { reason?: string };
};

export type EmailJobName = keyof EmailJobMap;
export type EmailJobData<T extends EmailJobName> = EmailJobMap[T];
