export const EMAIL_QUEUE = 'email';

// Поля, которые бэк кладёт в каждое уведомление (NotificationService)
type NotificationBase = {
  to: string;
  name: string | null;
  orgName: string;
  actionUrl: string;
};

export type ReviewProduct = { sku: string; name: string };

// Имя задачи в очереди = имя события на бэке (src/notification/notification.events.ts)
export type EmailJobMap = {
  'welcome': { to: string };
  'login-code': { to: string; code: string };
  'statform.ready': NotificationBase & { period: string; countries: string[]; statformIds: string[]; partial: boolean };
  'statform.failed': NotificationBase & { period: string; cause?: 'rate_unavailable'; reason?: string };
  'products.need-review': NotificationBase & { period: string; products: ReviewProduct[] };
  'ozon.api-error': NotificationBase & { reason?: string };
};

export type EmailJobName = keyof EmailJobMap;
export type EmailJobData<T extends EmailJobName> = EmailJobMap[T];
