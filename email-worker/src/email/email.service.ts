import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from './templates/welcome';
import { VerifyEmailTemplate } from './templates/verify-email';
import { ResetPasswordTemplate } from './templates/reset-password';
import type { EmailJobData, EmailJobName } from './email.types';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_FROM ?? 'FTS <noreply@fts.ru>';
  }

  async send<T extends EmailJobName>(name: T, data: EmailJobData<T>): Promise<void> {
    const { subject, html } = await this.build(name, data);
    const to = (data as { to: string }).to;

    const { error } = await this.resend.emails.send({ from: this.from, to, subject, html });
    if (error) throw new Error(error.message);

    this.logger.log(`sent "${name}" → ${to}`);
  }

  private async build<T extends EmailJobName>(
    name: T,
    data: EmailJobData<T>,
  ): Promise<{ subject: string; html: string }> {
    switch (name) {
      case 'welcome': {
        const d = data as EmailJobData<'welcome'>;
        return {
          subject: `Добро пожаловать в FTS, ${d.name}!`,
          html: await render(WelcomeEmail({ name: d.name })),
        };
      }
      case 'verify-email': {
        const d = data as EmailJobData<'verify-email'>;
        return {
          subject: 'Подтвердите ваш email — FTS',
          html: await render(VerifyEmailTemplate({ name: d.name, verifyUrl: d.verifyUrl })),
        };
      }
      case 'reset-password': {
        const d = data as EmailJobData<'reset-password'>;
        return {
          subject: 'Сброс пароля — FTS',
          html: await render(ResetPasswordTemplate({ name: d.name, resetUrl: d.resetUrl })),
        };
      }
      default:
        throw new Error(`Unknown email job: ${name as string}`);
    }
  }
}
