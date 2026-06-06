export const EMAIL_QUEUE = 'email';

export type WelcomeJobData = {
  to: string;
  name: string;
};

export type VerifyEmailJobData = {
  to: string;
  name: string;
  verifyUrl: string;
};

export type ResetPasswordJobData = {
  to: string;
  name: string;
  resetUrl: string;
};

export type EmailJobMap = {
  'welcome': WelcomeJobData;
  'verify-email': VerifyEmailJobData;
  'reset-password': ResetPasswordJobData;
};

export type EmailJobName = keyof EmailJobMap;
export type EmailJobData<T extends EmailJobName> = EmailJobMap[T];
