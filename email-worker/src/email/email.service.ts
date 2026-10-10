import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { WelcomeEmail } from './templates/welcome';
import { LoginCodeTemplate } from './templates/login-code';
import type { EmailJobData, EmailJobName } from './email.types';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_FROM ?? 'FTS <noreply@fts.ru>';
  }

  // возвращает id письма в Resend — по нему его видно в дашборде Resend
  async send<T extends EmailJobName>(name: T, data: EmailJobData<T>): Promise<string> {
    const { subject, html } = await this.build(name, data);
    const to = (data as { to: string }).to;

    const { data: sent, error } = await this.resend.emails.send({ from: this.from, to, subject, html });
    if (error) throw new Error(`Resend: ${error.message}`);

    return sent?.id ?? 'unknown';
  }

  private async build<T extends EmailJobName>(
    name: T,
    data: EmailJobData<T>,
  ): Promise<{ subject: string; html: string }> {
    switch (name) {
      case 'welcome': {
        return {
          subject: 'Добро пожаловать в FTS!',
          html: await render(WelcomeEmail()),
        };
      }
      case 'login-code': {
        const d = data as EmailJobData<'login-code'>;
        return {
          subject: `${d.code} — код для входа в FTS`,
          html: await render(LoginCodeTemplate({ code: d.code })),
        };
      }
      default:
        throw new Error(`Unknown email job: ${name as string}`);
    }
  }
}
