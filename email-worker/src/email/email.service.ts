import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import { EMAIL_TEMPLATES } from './email.templates';
import { BackApiClient } from './back-api.client';
import type { EmailJobData, EmailJobName } from './email.types';

// skipped — prepare решил, что письмо уже не нужно
export type SendResult = { resendId: string; attachments: number } | { skipped: true };

@Injectable()
export class EmailService {
  private readonly resend: Resend;
  private readonly from: string;
  // куда уходят ответы на письма; пока MX домена не на Resend — служебный адрес приёма inbox help@
  private readonly replyTo = process.env.EMAIL_REPLY_TO || undefined;

  constructor(private readonly back: BackApiClient) {
    this.resend = new Resend(process.env.RESEND_API_KEY);
    this.from = process.env.EMAIL_FROM ?? 'easyfts <noreply@easyfts.ru>';
  }

  // resendId — по нему письмо видно в дашборде Resend
  async send<T extends EmailJobName>(name: T, jobData: EmailJobData<T>): Promise<SendResult> {
    const template = EMAIL_TEMPLATES[name];
    if (!template) throw new Error(`Unknown email job: ${String(name)}`);

    const data = template.prepare ? await template.prepare(jobData, this.back) : jobData;
    if (!data) return { skipped: true };

    const subject = template.subject(data);
    const html = await render(template.render(data));
    // не удалось получить файл → ошибка → BullMQ повторит задачу; письмо без вложений не уходит
    const attachments = (await template.attachments?.(data, this.back)) ?? [];

    const { data: sent, error } = await this.resend.emails.send({
      from: this.from,
      to: data.to,
      replyTo: this.replyTo,
      subject,
      html,
      attachments: attachments.map((a) => ({ filename: a.filename, content: Buffer.from(a.content, 'utf-8') })),
    });
    if (error) throw new Error(`Resend: ${error.message}`);

    return { resendId: sent?.id ?? 'unknown', attachments: attachments.length };
  }
}
