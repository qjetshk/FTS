import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { EMAIL_TEMPLATES } from './email.templates';
import type { EmailJobData, EmailJobName } from './email.types';

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_FROM ?? 'easyfts <noreply@easyfts.ru>';
  }

  // возвращает id письма в Resend — по нему его видно в дашборде Resend
  async send<T extends EmailJobName>(name: T, data: EmailJobData<T>): Promise<string> {
    const template = EMAIL_TEMPLATES[name];
    if (!template) throw new Error(`Unknown email job: ${String(name)}`);

    const subject = template.subject(data);
    const html = await render(template.render(data));

    const { data: sent, error } = await this.resend.emails.send({ from: this.from, to: data.to, subject, html });
    if (error) throw new Error(`Resend: ${error.message}`);

    return sent?.id ?? 'unknown';
  }
}
