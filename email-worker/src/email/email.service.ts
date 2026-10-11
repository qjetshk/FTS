import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { EMAIL_TEMPLATES } from './email.templates';
import { BackApiClient } from './back-api.client';
import type { EmailJobData, EmailJobName } from './email.types';

export type SendResult = { resendId: string; attachments: number };

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;

  constructor(private readonly back: BackApiClient) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_FROM ?? 'easyfts <noreply@easyfts.ru>';
  }

  // resendId — по нему письмо видно в дашборде Resend
  async send<T extends EmailJobName>(name: T, data: EmailJobData<T>): Promise<SendResult> {
    const template = EMAIL_TEMPLATES[name];
    if (!template) throw new Error(`Unknown email job: ${String(name)}`);

    const subject = template.subject(data);
    const html = await render(template.render(data));
    // не удалось получить файл → ошибка → BullMQ повторит задачу; письмо без вложений не уходит
    const attachments = (await template.attachments?.(data, this.back)) ?? [];

    const { data: sent, error } = await this.resend.emails.send({
      from: this.from,
      to: data.to,
      subject,
      html,
      attachments: attachments.map((a) => ({ filename: a.filename, content: Buffer.from(a.content, 'utf-8') })),
    });
    if (error) throw new Error(`Resend: ${error.message}`);

    return { resendId: sent?.id ?? 'unknown', attachments: attachments.length };
  }
}
