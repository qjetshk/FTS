import { Injectable } from '@nestjs/common';

export type EmailAttachment = { filename: string; content: string };

// Внутренний API бэка (x-api-key). Нужен, чтобы не класть содержимое файлов (с ПДн) в задачи очереди.
@Injectable()
export class BackApiClient {
  private readonly baseUrl = process.env.BACK_INTERNAL_URL;
  private readonly apiKey = process.env.INTERNAL_API_KEY;

  async getStatformFile(id: string): Promise<EmailAttachment> {
    if (!this.baseUrl || !this.apiKey) throw new Error('BACK_INTERNAL_URL / INTERNAL_API_KEY не заданы');

    const res = await fetch(`${this.baseUrl}/statforms/internal/${encodeURIComponent(id)}/file`, {
      headers: { 'x-api-key': this.apiKey },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) throw new Error(`back: statform ${id} file → ${res.status}`);
    return (await res.json()) as EmailAttachment;
  }
}
