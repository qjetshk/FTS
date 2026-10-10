export const EMAIL_QUEUE = 'email';

export type WelcomeJobData = {
  to: string;
};

export type LoginCodeJobData = {
  to: string;
  code: string;
};

export type EmailJobMap = {
  'welcome': WelcomeJobData;
  'login-code': LoginCodeJobData;
};

export type EmailJobName = keyof EmailJobMap;
export type EmailJobData<T extends EmailJobName> = EmailJobMap[T];
